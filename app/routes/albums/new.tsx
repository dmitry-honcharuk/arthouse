import { Button, Paper, TextField, Typography } from '@mui/material';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect, Response } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { castArray } from 'lodash';
import * as React from 'react';
import { useState } from 'react';
import { z } from 'zod';
import { createAlbum } from '~/modules/albums/create-album';
import { getAlbumPath } from '~/modules/albums/get-album-path';
import { ProjectsAutocomplete } from '~/modules/projects/components/projects-autocomplete';
import { getProjects } from '~/modules/projects/get-projects';
import type { FullProject } from '~/modules/projects/types/full-project';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import { requireLoggedInUser } from '~/server/require-logged-in-user.server';
import { validateFormData } from '~/server/validate-form-data.server';

interface LoaderData {
  currentUser: UserWithProfile;
  projects: FullProject[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const currentUser = await requireLoggedInUser(request);
  const projects = await getProjects({ userId: currentUser.id });

  return json<LoaderData>({
    currentUser,
    projects,
  });
};

export const action: ActionFunction = async ({ request }) => {
  const [user, formData] = await Promise.all([
    requireLoggedInUser(request),
    request.formData(),
  ]);

  const { name, projects: project } = validateFormData(
    formData,
    z.object({
      name: z.string().nonempty(),
      projects: z.union([z.string(), z.array(z.string())]).optional(),
    })
  );

  const projects = project ? castArray(project) : [];

  if (projects.length) {
    const userProjectIds = await getProjects({ userId: user.id }).then(
      (projects) => projects.map(({ id }) => id)
    );

    if (!projects.every((id) => userProjectIds.includes(id))) {
      throw new Response('Invalid projects', { status: 401 });
    }
  }

  const album = await createAlbum({
    userId: user.id,
    name,
    projectIds: projects,
  });

  return redirect(getAlbumPath(album, user));
};

export default function NewAlbum() {
  const { projects } = useLoaderData<LoaderData>();

  const [projectIds, setProjectIds] = useState<string[]>([]);

  return (
    <Form className="flex flex-col gap-4 max-w-2xl pt-10" method="post">
      <Typography variant="h3">Create new album</Typography>

      <Paper className="p-4 flex flex-col gap-3" elevation={3}>
        <TextField autoFocus name="name" label="Album name" required />
        {projectIds.map((id) => (
          <input key={id} type="hidden" name="projects" value={id} />
        ))}
        <ProjectsAutocomplete projects={projects} onChange={setProjectIds} />
        <Button variant="contained" className="self-end" type="submit">
          Create
        </Button>
      </Paper>
    </Form>
  );
}
