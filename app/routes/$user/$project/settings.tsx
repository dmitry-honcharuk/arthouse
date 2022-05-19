import {
  FolderOutlined,
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
import type { Project } from '@prisma/client';
import { ProjectStatus } from '@prisma/client';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigate,
} from '@remix-run/react';
import { castArray } from 'lodash';
import type { FC } from 'react';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { Breadcrumbs } from '~/modules/common/breadcrumbs';
import { EditableCardSection } from '~/modules/common/editable-card-section';
import PageLayout from '~/modules/common/page-layout';
import { SecuritySwitch } from '~/modules/common/security-switch';
import { getDecryptedSecurity } from '~/modules/crypto/get-decrypted-security';
import { GeneralSection } from '~/modules/projects/components/project-settings/general-settings';
import { PasswordSetting } from '~/modules/projects/components/project-settings/password-setting';
import { deleteProject } from '~/modules/projects/delete-project';
import { getProjectPath } from '~/modules/projects/get-project-path';
import { getUserProject } from '~/modules/projects/get-user-project';
import { setProjectPassword } from '~/modules/projects/set-project-password.server';
import type { ProjectWithItems } from '~/modules/projects/types/project-with-items';
import type { WithDecryptedProjectSecurity } from '~/modules/projects/types/with-decrypted-project-security';
import { updateProject } from '~/modules/projects/update-project';
import { SectionTitle } from '~/modules/users/components/profile/section-title';
import { getUserPath } from '~/modules/users/get-user-path';
import type { WithUser } from '~/modules/users/types/with-user';
import { ActionBuilder } from '~/server/action-builder.server';
import { FormDataHandler } from '~/server/form-data-handler.server';
import { requireLoggedInUser } from '~/server/require-logged-in-user.server';

interface LoaderData {
  project: ProjectWithItems & WithUser & WithDecryptedProjectSecurity;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { user, project: projectID } = z
    .object({
      user: z.string(),
      project: z.string(),
    })
    .parse(params);

  const [project, currentUser] = await Promise.all([
    getUserProject(user, projectID),
    requireLoggedInUser(request),
  ]);

  if (!project) {
    throw new Response(null, { status: 404 });
  }

  const isCurrentUser = currentUser.id === project.userId;

  if (!isCurrentUser) {
    throw new Response(null, { status: 404 });
  }

  return json<LoaderData>({
    project: {
      ...project,
      security: project.security
        ? await getDecryptedSecurity(project.security)
        : null,
    },
  });
};

export const action: ActionFunction = async (actionDetails) => {
  const { request, params } = actionDetails;

  const { user: userID, project: projectID } = z
    .object({
      user: z.string(),
      project: z.string(),
    })
    .parse(params);

  const [currentUser, project] = await Promise.all([
    requireLoggedInUser(request, { shouldThrow: true }),
    getUserProject(userID, projectID),
  ]);

  if (!project || project.userId !== currentUser.id) {
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

        const currentPassword = project.security
          ? (await getDecryptedSecurity(project.security)).password
          : null;

        return json(
          password !== currentPassword
            ? await setProjectPassword(project.id, password)
            : {}
        );
      }

      const projectDetails: Partial<Project> = {};

      if (fields.includes('status')) {
        const { status } = await formDataHandler.validate(
          z.object({
            status: z.nativeEnum(ProjectStatus),
          })
        );

        projectDetails.status = status;
      }

      if (fields.includes('preview')) {
        const { preview } = await formDataHandler.validate(
          z.object({
            preview: z.string(),
          })
        );

        projectDetails.preview = preview;
      }

      if (fields.includes('secure')) {
        const { secure } = await formDataHandler.validate(
          z.object({
            secure: z.union([z.literal('true'), z.literal('false')]),
          })
        );

        projectDetails.isSecure = secure === 'true';
      }

      if (fields.includes('general')) {
        const { name, caption, slug } = await formDataHandler.validate(
          z.object({
            name: z.string(),
            caption: z.string().optional(),
            slug: z.string().optional(),
          })
        );

        projectDetails.name = name;
        projectDetails.slug = slug || null;
        projectDetails.caption = caption || null;
      }

      return json(await updateProject(project.id, projectDetails));
    })
    .use('DELETE', async () => {
      await deleteProject(project.id);

      return redirect(`/${getUserPath(currentUser)}`);
    })
    .build();
};

export default function ProjectSettings() {
  const { project } = useLoaderData<LoaderData>();
  const actionProject = useActionData<Project>();
  const [modalOpen, setModalOpen] = useState(false);

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (!actionProject) {
      return;
    }

    if (project.slug === actionProject.slug) {
      return;
    }

    navigate(`/${getProjectPath(actionProject, project.user)}/settings`);
  }, [actionProject, project.slug, project.user, navigate]);

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
              label: project.user.profile?.nickname ?? null,
              link: `/${getUserPath(project.user)}`,
            },
            {
              icon: <FolderOutlined sx={{ mr: 0.5 }} fontSize="small" />,
              label: project.name,
              link: `/${getProjectPath(project, project.user)}`,
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
        <GeneralSection project={project} />
        <EditableCardSection
          renderTitle={({ isEdit, toggleIsEdit }) => (
            <SectionTitle variant="h5" onEdit={toggleIsEdit} isEdit={isEdit}>
              Project security
            </SectionTitle>
          )}
          render={({ isEdit, setIsEdit }) => (
            <Box display="grid" gridTemplateColumns="auto 1fr" gap={2}>
              <Key />
              <PasswordSetting
                item={project}
                isEdit={isEdit}
                onSuccess={() => setIsEdit(false)}
                helperText="Password is required to access secured project"
                noPasswordMessage="You didn't specify password for this project yet"
              />
              <LockOutlined />
              <SecuritySwitchSetting
                project={project}
                onSuccess={() => setIsEdit(false)}
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
                Delete project
              </Typography>
              <Typography variant="body2" gutterBottom>
                This action is not reversible.
              </Typography>
              <Typography>
                All associated slides would also be deleted.
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
                Delete this project
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
          Delete {project.name} project
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <Typography gutterBottom>
              Are you sure you want to delete this project?
            </Typography>
            <Typography fontWeight="bold" gutterBottom>
              This action is not reversible.
            </Typography>
            <Typography>
              All associated slides would also be deleted.
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

const SecuritySwitchSetting: FC<{
  project: Project & WithDecryptedProjectSecurity;
  onSuccess: () => void;
}> = ({ project, onSuccess }) => {
  const fetcher = useFetcher();

  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <fetcher.Form method="put" ref={formRef}>
      <input type="hidden" name="fields" value="secure" />
      <SecuritySwitch
        tooltip="You need to setup a password in order to secure this project."
        isSecure={project.isSecure}
        disabled={!project.security}
        onChange={(secure) => {
          const formData = new FormData(formRef.current!);

          formData.set('secure', secure ? 'true' : 'false');

          fetcher.submit(formData, { method: 'put' });

          onSuccess();
        }}
      />
    </fetcher.Form>
  );
};
