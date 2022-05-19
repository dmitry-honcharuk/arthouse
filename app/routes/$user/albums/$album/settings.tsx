import {
  FolderCopyOutlined,
  GridViewOutlined,
  Key,
  LockOutlined,
  PersonPin,
  SettingsOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import type { Album } from '@prisma/client';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
} from '@remix-run/react';
import { castArray } from 'lodash';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { GeneralSection } from '~/modules/albums/components/settings/general-section';
import { deleteAlbum } from '~/modules/albums/delete-album';
import { getAlbumPath } from '~/modules/albums/get-album-path';
import { getAlbumSecretKey } from '~/modules/albums/get-album-secret-key';
import { getUserAlbum } from '~/modules/albums/get-user-album';
import { setAlbumPassword } from '~/modules/albums/set-album-password.server';
import type { WithDecryptedAlbumSecurity } from '~/modules/albums/types/with-decrypted-album-security';
import { updateAlbum } from '~/modules/albums/update-album';
import { Breadcrumbs } from '~/modules/common/breadcrumbs';
import { EditableCardSection } from '~/modules/common/editable-card-section';
import PageLayout from '~/modules/common/page-layout';
import { SecuritySwitchSetting } from '~/modules/common/security-switch-setting';
import { getDecryptedSecurity } from '~/modules/crypto/get-decrypted-security';
import { PasswordSetting } from '~/modules/projects/components/project-settings/password-setting';
import { SectionTitle } from '~/modules/users/components/profile/section-title';
import { getUserPath } from '~/modules/users/get-user-path';
import type { WithUser } from '~/modules/users/types/with-user';
import { ActionBuilder } from '~/server/action-builder.server';
import { FormDataHandler } from '~/server/form-data-handler.server';
import { requireLoggedInUser } from '~/server/require-logged-in-user.server';

interface LoaderData {
  album: Album & WithUser & WithDecryptedAlbumSecurity;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { user, album: albumID } = z
    .object({
      user: z.string(),
      album: z.string(),
    })
    .parse(params);

  const [album, currentUser] = await Promise.all([
    getUserAlbum(user, albumID),
    requireLoggedInUser(request),
  ]);

  if (!album) {
    throw new Response(null, { status: 404 });
  }

  const isCurrentUser = currentUser.id === album.userId;

  if (!isCurrentUser) {
    throw new Response(null, { status: 404 });
  }

  return json<LoaderData>({
    album: {
      ...album,
      security: album.security
        ? await getDecryptedSecurity(album.security, getAlbumSecretKey())
        : null,
    },
  });
};

export const action: ActionFunction = async (actionDetails) => {
  const { request, params } = actionDetails;

  const { user: userID, album: albumID } = z
    .object({
      user: z.string(),
      album: z.string(),
    })
    .parse(params);

  const [currentUser, album] = await Promise.all([
    requireLoggedInUser(request, { shouldThrow: true }),
    getUserAlbum(userID, albumID),
  ]);

  if (!album || album.userId !== currentUser.id) {
    throw new Response(null, { status: 401 });
  }

  const formDataHandler = new FormDataHandler(request);

  return new ActionBuilder(actionDetails)
    .use('PUT', async () => {
      const { fields: field } = await formDataHandler.validate(
        z.object({
          fields: z.union([z.string(), z.array(z.string())]),
        })
      );

      const fields = castArray(field);

      if (fields.includes('password')) {
        const { password } = await formDataHandler.validate(
          z.object({
            password: z.string().nonempty(),
          })
        );

        const currentPassword = album.security
          ? (await getDecryptedSecurity(album.security, getAlbumSecretKey()))
              .password
          : null;

        return json(
          password !== currentPassword
            ? await setAlbumPassword(album.id, password)
            : {}
        );
      }

      const albumDetails: Partial<Album> = {};

      if (fields.includes('secure')) {
        const { secure } = await formDataHandler.validate(
          z.object({
            secure: z.union([z.literal('true'), z.literal('false')]),
          })
        );

        albumDetails.isSecure = secure === 'true';
      }

      if (fields.includes('name')) {
        const { name, slug } = await formDataHandler.validate(
          z.object({
            name: z.string(),
            slug: z.string().optional(),
          })
        );

        albumDetails.name = name;
        albumDetails.slug = slug || null;
      }

      return json(await updateAlbum(album.id, albumDetails));
    })
    .use('DELETE', async () => {
      await deleteAlbum(album.id);

      return redirect(`/${getUserPath(currentUser)}`);
    })
    .build();
};

export default function AlbumSettings() {
  const { album } = useLoaderData<LoaderData>();
  const actionAlbum = useActionData<Album>();

  const navigate = useNavigate();

  useEffect(() => {
    if (!actionAlbum) {
      return;
    }

    if (album.slug === actionAlbum.slug) {
      return;
    }

    navigate(`/${getAlbumPath(actionAlbum, album.user)}/settings`);
  }, [actionAlbum, album.slug, album.user, navigate]);

  const [modalOpen, setModalOpen] = useState(false);

  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <PageLayout
      breadcrumbs={
        <Breadcrumbs
          items={[
            {
              icon: <GridViewOutlined sx={{ mr: 0.5 }} fontSize="small" />,
              label: 'Browse',
              link: '/',
            },
            {
              icon: <PersonPin sx={{ mr: 0.5 }} fontSize="small" />,
              label: album.user.profile?.nickname ?? null,
              link: `/${getUserPath(album.user)}`,
            },
            {
              icon: <FolderCopyOutlined sx={{ mr: 0.5 }} fontSize="small" />,
              label: album.name,
              link: `/${getAlbumPath(album, album.user)}`,
            },
            {
              icon: <SettingsOutlined sx={{ mr: 0.5 }} fontSize="small" />,
              label: 'Settings',
            },
          ]}
        />
      }
    >
      <main className="flex flex-col gap-10">
        <GeneralSection album={album} />
        <EditableCardSection
          renderTitle={({ isEdit, toggleIsEdit }) => (
            <SectionTitle variant="h5" onEdit={toggleIsEdit} isEdit={isEdit}>
              Album security
            </SectionTitle>
          )}
          render={({ isEdit, setIsEdit }) => (
            <Box display="grid" gridTemplateColumns="auto 1fr" gap={2}>
              <Key />
              <PasswordSetting
                item={album}
                isEdit={isEdit}
                onSuccess={() => setIsEdit(false)}
                helperText="Password is required to access secured album"
                noPasswordMessage="You didn't specify password for this album yet"
              />
              <LockOutlined />
              <SecuritySwitchSetting
                item={album}
                onSuccess={() => setIsEdit(false)}
                tooltip="You need to setup a password in order to secure this album."
              />
            </Box>
          )}
        />
        <section>
          <Typography variant="h5" color="error" gutterBottom>
            Danger area
          </Typography>
          <Card
            variant="outlined"
            sx={({ palette }) => ({
              '&.MuiPaper-root': {
                borderColor: palette.error.main,
              },
            })}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Delete album
              </Typography>
              <Typography variant="body2" gutterBottom>
                This action is not reversible.
              </Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={() => setModalOpen(true)}
                sx={({ breakpoints }) => ({
                  [breakpoints.up('sm')]: {
                    width: '50%',
                  },
                })}
              >
                Delete this album
              </Button>
            </CardActions>
          </Card>
        </section>
      </main>
      <Dialog
        open={modalOpen}
        onClose={handleModalClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Delete {album.name} album
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <Typography gutterBottom>
              Are you sure you want to delete this album?
            </Typography>
            <Typography fontWeight="bold" gutterBottom>
              This action is not reversible.
            </Typography>
          </DialogContentText>
        </DialogContent>
        <Form
          method="delete"
          onSubmit={() => {
            handleModalClose();
          }}
        >
          <DialogActions>
            <Button onClick={handleModalClose} variant="outlined" type="button">
              Cancel
            </Button>
            <Button type="submit" autoFocus variant="contained" color="error">
              Delete
            </Button>
          </DialogActions>
        </Form>
      </Dialog>
    </PageLayout>
  );
}
