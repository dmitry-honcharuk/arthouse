import {
  GppGoodOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from '@mui/icons-material';
import {
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { Album } from '@prisma/client';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import * as React from 'react';
import { z } from 'zod';
import { getAlbumPath } from '~/modules/albums/get-album-path';
import { getUserAlbum } from '~/modules/albums/get-user-album';
import { TogglableContent } from '~/modules/common/togglable-content';
import { getDecryptedSecurity } from '~/modules/crypto/get-decrypted-security';
import { getUserByIdentifier } from '~/modules/users/getUserById';
import { ActionBuilder } from '~/server/action-builder.server';
import {
  commitAlbumAuthSession,
  getAlbumAuthSession,
} from '~/server/album-auth-session.server';
import { FormDataHandler } from '~/server/form-data-handler.server';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';

interface LoaderData {
  album: Album;
  projectIdentifier: string | null;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const projectIdentifier = new URL(request.url).searchParams.get('project');

  const { user: userID, album: albumID } = z
    .object({
      album: z.string(),
      user: z.string(),
    })
    .parse(params);

  const user = await getUserByIdentifier(userID);

  if (!user) {
    throw new Response(null, { status: 404 });
  }

  const [currentUser, album] = await Promise.all([
    getLoggedInUser(request),
    getUserAlbum(user, albumID),
  ]);

  if (!album) {
    throw new Response(null, { status: 404 });
  }

  const isCurrentUser = currentUser?.id === album.userId;

  const albumAuthSession = await getAlbumAuthSession(
    request.headers.get('Cookie')
  );

  if (
    isCurrentUser ||
    !album.isSecure ||
    !album.security ||
    albumAuthSession.get(album.id) === album.security.passwordVersion
  ) {
    const albumPath = `/${getAlbumPath(album, album.user)}`;

    return redirect(
      projectIdentifier ? `${albumPath}/${projectIdentifier}` : albumPath
    );
  }

  return json<LoaderData>({ album, projectIdentifier });
};

export const action: ActionFunction = async (actionDetails) => {
  const formDataHandler = new FormDataHandler(actionDetails.request);
  const albumAuthSession = await getAlbumAuthSession(
    actionDetails.request.headers.get('Cookie')
  );

  const { user, album: albumID } = z
    .object({
      user: z.string(),
      album: z.string(),
    })
    .parse(actionDetails.params);

  const album = await getUserAlbum(user, albumID);

  if (!album) {
    throw new Response(null, { status: 404 });
  }

  return new ActionBuilder(actionDetails)
    .use('PUT', async () => {
      const {
        albumId,
        password: passwordAttempt,
        projectIdentifier,
      } = await formDataHandler.validate(
        z.object({
          albumId: z.string(),
          password: z.string(),
          projectIdentifier: z.string().optional(),
        })
      );

      const albumPath = `/${getAlbumPath(album, album.user)}`;

      const redirectPath = projectIdentifier
        ? `${albumPath}/${projectIdentifier}`
        : albumPath;

      if (!album.security) {
        return redirect(redirectPath);
      }

      const { password } = await getDecryptedSecurity(album.security);

      const isPasswordValid = passwordAttempt === password;

      if (isPasswordValid) {
        albumAuthSession.set(albumId, album.security.passwordVersion);
      } else {
        albumAuthSession.unset(albumId);
      }

      const headers = {
        'Set-Cookie': await commitAlbumAuthSession(albumAuthSession),
      };

      if (isPasswordValid) {
        return redirect(redirectPath, {
          headers,
        });
      }

      return json(
        { password: 'Password is invalid.', projectIdentifier },
        {
          status: 401,
          headers,
        }
      );
    })
    .build();
};

export default function AuthorizeProjectPage() {
  const { album, projectIdentifier } = useLoaderData<LoaderData>();
  const action = useActionData<{
    password?: string;
    projectIdentifier?: string;
  }>();

  const projectID = action?.projectIdentifier || projectIdentifier;

  return (
    <Stack component="main" alignItems="center" paddingY={8}>
      <Stack
        direction="row"
        alignItems="flex-start"
        gap={1}
        width={500}
        maxWidth="100%"
      >
        <GppGoodOutlined fontSize="large" />

        <Stack gap={4}>
          <div>
            <Typography variant="h4">
              <span>{album.name}</span>
            </Typography>
            <Typography>
              You need to enter a password in order to see this album
            </Typography>
          </div>
          <Stack component={Form} method="put" direction="column" gap={2}>
            <TogglableContent defaultValue={true}>
              {({ isEnabled: isHidden, toggle }) => (
                <TextField
                  name="password"
                  label="Password"
                  type={isHidden ? 'password' : 'text'}
                  error={!!action?.password}
                  helperText={action?.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          size="small"
                          onClick={toggle}
                          edge="end"
                        >
                          {isHidden ? (
                            <VisibilityOutlined />
                          ) : (
                            <VisibilityOffOutlined />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  required
                />
              )}
            </TogglableContent>

            <input type="hidden" name="albumId" value={album.id} />
            {projectID && (
              <input type="hidden" name="projectIdentifier" value={projectID} />
            )}

            <div className="text-right">
              <Button type="submit" variant="outlined">
                Authorize
              </Button>
            </div>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
