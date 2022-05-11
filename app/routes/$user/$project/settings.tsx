import {
  FolderOutlined,
  GridViewOutlined,
  Key,
  LockOutlined,
  PersonPin,
  SettingsOutlined,
} from '@mui/icons-material';
import { Box, Card, CardContent } from '@mui/material';
import type { Project } from '@prisma/client';
import { ProjectStatus } from '@prisma/client';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { castArray } from 'lodash';
import type { FC } from 'react';
import * as React from 'react';
import { useRef } from 'react';
import { z } from 'zod';
import { Breadcrumbs } from '~/modules/common/breadcrumbs';
import { EditableCardSection } from '~/modules/common/editable-card-section';
import PageLayout from '~/modules/common/page-layout';
import { SecuritySwitch } from '~/modules/common/security-switch';
import { PasswordSetting } from '~/modules/projects/components/project-settings/password-setting';
import { getDecryptedProjectSecurity } from '~/modules/projects/get-decrypted-project-security';
import { getProjectPassword } from '~/modules/projects/get-project-password';
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
      projectSecurity: project.projectSecurity
        ? await getDecryptedProjectSecurity(project.projectSecurity)
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
    requireLoggedInUser(request),
    getUserProject(userID, projectID),
  ]);

  if (!currentUser || !project) {
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

        const currentPassword = project.projectSecurity
          ? await getProjectPassword(project.projectSecurity)
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

      return json(await updateProject(project.id, projectDetails));
    })
    .build();
};

export default function ProjectSettings() {
  const { project } = useLoaderData<LoaderData>();

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
        <Card variant="outlined">
          <CardContent>
            <div>Project general settings</div>
            <div>Name</div>
            <div>Caption</div>
          </CardContent>
        </Card>
        <EditableCardSection
          renderTitle={({ isEdit, toggleIsEdit }) => (
            <SectionTitle variant="h5" onEdit={toggleIsEdit} isEdit={isEdit}>
              Project security
            </SectionTitle>
          )}
          render={({ isEdit, setIsEdit }) => (
            <Box
              display="grid"
              gridTemplateAreas="'password-label password-value' 'security-label security-value'"
              gridTemplateColumns="auto 1fr"
              gap={2}
            >
              <Box gridArea="password-label">
                <Key />
              </Box>
              <Box gridArea="password-value">
                <PasswordSetting
                  project={project}
                  isEdit={isEdit}
                  onSuccess={() => setIsEdit(false)}
                />
              </Box>
              <Box gridArea="security-label">
                <LockOutlined />
              </Box>
              <Box gridArea="security-value">
                <SecuritySwitchSetting
                  project={project}
                  onSuccess={() => setIsEdit(false)}
                />
              </Box>
            </Box>
          )}
        />
        <Card variant="outlined">
          <CardContent>
            <div>Project danger area</div>
          </CardContent>
        </Card>
      </main>
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
        disabled={!project.projectSecurity}
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
