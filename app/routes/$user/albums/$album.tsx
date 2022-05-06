import { Add, ArrowBackIosNew } from '@mui/icons-material';
import { Button, Paper, Typography } from '@mui/material';
import type { Album, Project } from '@prisma/client';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { castArray } from 'lodash';
import * as React from 'react';
import { z } from 'zod';
import { AlbumProjectsForm } from '~/modules/albums/components/album-projects-form';
import { AlbumTitleForm } from '~/modules/albums/components/album-title-form';
import { getAlbumById } from '~/modules/albums/get-album-by-id';
import { getUserAlbums } from '~/modules/albums/get-user-albums';
import type { Details as UpdateAlbumDetails } from '~/modules/albums/update-album';
import { updateAlbum } from '~/modules/albums/update-album';
import { EditButton } from '~/modules/common/edit-button';
import { TogglableContent } from '~/modules/common/togglable-content';
import { ProjectCard } from '~/modules/projects/components/project-card';
import { Projects } from '~/modules/projects/components/project-list';
import { getProjectPath } from '~/modules/projects/get-project-path';
import { getUserProjects } from '~/modules/projects/get-user-projects';
import type { WithProjects } from '~/modules/projects/types/with-projects';
import { getUserPath } from '~/modules/users/get-user-path';
import type { WithUser } from '~/modules/users/types/with-user';
import { getRequestFormData } from '~/server/get-form-data.server';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';
import { requireLoggedInUser } from '~/server/require-logged-in-user.server';
import { validateFormData } from '~/server/validate-form-data.server';

interface LoaderData {
  isCurrentUser: boolean;
  album: Album & WithProjects & WithUser;
  projects: Project[];
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { user: userID, album: albumId } = z
    .object({
      album: z.string(),
      user: z.string(),
    })
    .parse(params);

  const [currentUser, album, projects] = await Promise.all([
    getLoggedInUser(request),
    getAlbumById(albumId),
    getUserProjects(userID),
  ]);

  if (!album) {
    throw new Response('Not Found', { status: 404 });
  }

  const isCurrentUser = currentUser?.id === album.userId;

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

  const { user, album } = z
    .object({
      user: z.string(),
      album: z.string(),
    })
    .parse(params);

  const [currentUser, albums] = await Promise.all([
    requireLoggedInUser(request),
    getUserAlbums(user),
  ]);

  if (currentUser.id !== user && currentUser.profile?.nickname !== user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  if (!albums.find(({ id }) => id === album)) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const formData = await getRequestFormData(request);

  const { fields: field } = validateFormData(
    formData,
    z.object({
      fields: z.union([z.string(), z.array(z.string())]),
    })
  );

  const fields = castArray(field);

  const albumFields: UpdateAlbumDetails = {};

  if (fields.includes('projects')) {
    const { projects } = validateFormData(
      formData,
      z.object({
        projects: z.union([z.string(), z.array(z.string())]).optional(),
      })
    );

    albumFields.projectIds = projects ? castArray(projects) : [];
  }

  if (fields.includes('name')) {
    const { name } = validateFormData(
      formData,
      z.object({
        name: z.string().nonempty(),
      })
    );

    albumFields.name = name;
  }

  return json(await updateAlbum(album, albumFields));
};

export default function AlbumScreen() {
  const { album, isCurrentUser, projects } = useLoaderData<LoaderData>();

  return (
    <>
      <div className="pt-4">
        <Link to={`/${getUserPath(album.user)}`}>
          <Button startIcon={<ArrowBackIosNew />} color="inherit">
            {isCurrentUser ? 'Your Projects' : 'User Projects'}
          </Button>
        </Link>
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex gap-2 items-center">
          <TogglableContent>
            {({ isEnabled, disable, enable }) => {
              if (!isEnabled) {
                return (
                  <div className="flex items-center gap-2">
                    <Typography variant="h4">{album.name}</Typography>
                    {isCurrentUser && <EditButton onClick={enable} />}
                  </div>
                );
              }

              return (
                <AlbumTitleForm
                  onSubmit={disable}
                  onCancel={disable}
                  album={album}
                />
              );
            }}
          </TogglableContent>
        </div>

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
                      link={`/${getProjectPath(project, album.user)}`}
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
                  <div className="flex justify-between mb-3">
                    <Typography variant="h5">Projects</Typography>
                    {isCurrentUser && !isEnabled && (
                      <EditButton onClick={enable} />
                    )}
                  </div>
                  <Paper className="p-4" variant="outlined">
                    {isEnabled ? form : displayProjects}
                  </Paper>
                </>
              );
            }}
          </TogglableContent>
        </div>
      </div>
    </>
  );
}
