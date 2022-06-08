import {
  Add,
  FolderCopyOutlined,
  GppGoodOutlined,
  GridViewOutlined,
  PersonPin,
  SettingsOutlined,
} from '@mui/icons-material';
import { Button, Paper, Stack, Typography } from '@mui/material';
import type { Album, Project } from '@prisma/client';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { castArray } from 'lodash';
import * as React from 'react';
import { z } from 'zod';
import { AlbumProjectsForm } from '~/modules/albums/components/album-projects-form';
import { getAlbumPath } from '~/modules/albums/get-album-path';
import { getUserAlbum } from '~/modules/albums/get-user-album';
import type { Details as UpdateAlbumDetails } from '~/modules/albums/update-album';
import { updateAlbum } from '~/modules/albums/update-album';
import { Breadcrumbs } from '~/modules/common/breadcrumbs';
import { EditButton } from '~/modules/common/edit-button';
import PageLayout from '~/modules/common/page-layout';
import { TogglableContent } from '~/modules/common/togglable-content';
import type { WithEncryptedSecurity } from '~/modules/crypto/types/with-encrypted-security';
import { ProjectCard } from '~/modules/projects/components/project-card';
import { Projects } from '~/modules/projects/components/project-list';
import { getProjectPath } from '~/modules/projects/get-project-path';
import { getUserProjects } from '~/modules/projects/get-user-projects';
import type { WithProjects } from '~/modules/projects/types/with-projects';
import { getUserPath } from '~/modules/users/get-user-path';
import { getUserByIdentifier } from '~/modules/users/getUserById';
import type { WithUser } from '~/modules/users/types/with-user';
import { getAlbumAuthSession } from '~/server/album-auth-session.server';
import { FormDataHandler } from '~/server/form-data-handler.server';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';
import { requireLoggedInUser } from '~/server/require-logged-in-user.server';

interface LoaderData {
  isCurrentUser: boolean;
  album: Album & WithProjects & WithUser & WithEncryptedSecurity;
  projects: Project[];
}

export const loader: LoaderFunction = async ({ request, params }) => {
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

  const [currentUser, album, projects] = await Promise.all([
    getLoggedInUser(request),
    getUserAlbum(user, albumID),
    getUserProjects(user),
  ]);

  if (!album) {
    throw new Response('Not Found', { status: 404 });
  }

  const isCurrentUser = currentUser?.id === album.userId;

  const session = await getAlbumAuthSession(request.headers.get('Cookie'));

  if (!isCurrentUser && album.isSecure && !album.security) {
    throw new Response(null, { status: 404 });
  }

  if (
    !isCurrentUser &&
    album.isSecure &&
    album.security &&
    session.get(album.id) !== album.security.passwordVersion
  ) {
    return redirect(`/${getAlbumPath(album, album.user)}/authorize`);
  }

  return json<LoaderData>({
    album,
    isCurrentUser,
    projects,
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method !== 'PUT') {
    throw new Response(null, { status: 405 });
  }

  const { user, album: albumID } = z
    .object({
      user: z.string(),
      album: z.string(),
    })
    .parse(params);

  const [currentUser, album] = await Promise.all([
    requireLoggedInUser(request),
    getUserAlbum(user, albumID),
  ]);

  if (currentUser.id !== user && currentUser.profile?.nickname !== user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  if (!album) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const formDataHandler = new FormDataHandler(request);

  const { fields: field } = await formDataHandler.validate(
    z.object({
      fields: z.union([z.string(), z.array(z.string())]),
    })
  );

  const fields = castArray(field);

  const albumFields: UpdateAlbumDetails = {};

  if (fields.includes('projects')) {
    const { projects } = await formDataHandler.validate(
      z.object({
        projects: z.union([z.string(), z.array(z.string())]).optional(),
      })
    );

    albumFields.projectIds = projects ? castArray(projects) : [];
  }

  if (fields.includes('name')) {
    const { name } = await formDataHandler.validate(
      z.object({
        name: z.string().nonempty(),
      })
    );

    albumFields.name = name;
  }

  return json(await updateAlbum(album.id, albumFields));
};

export default function AlbumScreen() {
  const { album, isCurrentUser, projects } = useLoaderData<LoaderData>();

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
            },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-8">
        <Stack
          direction="row"
          gap={1}
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="h4">{album.name}</Typography>
            {album.isSecure && album.security && <GppGoodOutlined />}
          </Stack>
          {isCurrentUser && (
            <Link to={`/${getAlbumPath(album, album.user)}/settings`}>
              <Button
                type="submit"
                startIcon={<SettingsOutlined />}
                variant="outlined"
              >
                Album Settings
              </Button>
            </Link>
          )}
        </Stack>

        <div>
          <TogglableContent>
            {({ isEnabled, enable, disable }) => {
              const form = (
                <AlbumProjectsForm
                  allProjects={projects}
                  defaultProjects={album.projects}
                  onSubmit={disable}
                  onCancel={disable}
                />
              );

              const projectList = (
                <Projects>
                  {album.projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      showStatus={isCurrentUser}
                      showIsSecured={isCurrentUser}
                      link={`/${getAlbumPath(
                        album,
                        album.user
                      )}/${getProjectPath(project)}`}
                    />
                  ))}
                </Projects>
              );

              const addProjectButton = (
                <div className="flex justify-center">
                  <Button
                    variant="outlined"
                    type="button"
                    startIcon={<Add />}
                    onClick={enable}
                  >
                    Add projects
                  </Button>
                </div>
              );

              const displayProjects = album.projects.length
                ? projectList
                : addProjectButton;

              return (
                <>
                  <div className="flex gap-4 mb-3">
                    {isCurrentUser && (
                      <Typography variant="h5">Projects</Typography>
                    )}
                    {isCurrentUser && !isEnabled && (
                      <EditButton onClick={enable} />
                    )}
                  </div>
                  {isCurrentUser ? (
                    <Paper className="p-4" variant="outlined">
                      {isEnabled ? form : displayProjects}
                    </Paper>
                  ) : isEnabled ? (
                    form
                  ) : (
                    displayProjects
                  )}
                </>
              );
            }}
          </TogglableContent>
        </div>
      </div>
    </PageLayout>
  );
}
