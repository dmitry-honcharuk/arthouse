import {
  AddBoxOutlined,
  GridViewOutlined,
  PersonPin,
} from '@mui/icons-material';
import { Button, Paper, TextField, Typography } from '@mui/material';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect, Response } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { castArray } from 'lodash';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { createAlbum } from '~/modules/albums/create-album';
import { getAlbumPath } from '~/modules/albums/get-album-path';
import { Breadcrumbs } from '~/modules/common/breadcrumbs';
import PageLayout from '~/modules/common/page-layout';
import { getURI } from '~/modules/common/utils/getURI';
import { ProjectsAutocomplete } from '~/modules/projects/components/projects-autocomplete';
import { getProjects } from '~/modules/projects/get-projects';
import type { FullProject } from '~/modules/projects/types/full-project';
import { getUserPath } from '~/modules/users/get-user-path';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import { FormDataHandler } from '~/server/form-data-handler.server';
import { requireLoggedInUser } from '~/server/require-logged-in-user.server';

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

  const {
    name,
    slug,
    projects: project,
  } = await FormDataHandler.validateFormData(
    formData,
    z.object({
      name: z.string().nonempty(),
      slug: z.string().optional(),
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
    slug: slug || null,
    projectIds: projects,
  });

  return redirect(getAlbumPath(album, user));
};

export default function NewAlbum() {
  const { projects, currentUser } = useLoaderData<LoaderData>();

  const [projectIds, setProjectIds] = useState<string[]>([]);

  const [slug, setSlug] = useState('');
  const dirtyRef = useRef(false);

  const [link, setLink] = useState('');

  useEffect(() => {
    setLink(`${location.host}/${getUserPath(currentUser)}/albums/${slug}`);
  }, [currentUser, slug]);

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
              label: currentUser.profile?.nickname ?? null,
              link: `/${getUserPath(currentUser)}`,
            },
            {
              icon: <AddBoxOutlined sx={{ mr: 0.5 }} fontSize="small" />,
              label: 'Album',
            },
          ]}
        />
      }
    >
      <Form className="flex flex-col gap-4 max-w-2xl" method="post">
        <Typography variant="h3">Create new album</Typography>

        <Paper className="p-4 flex flex-col gap-3" elevation={3}>
          <TextField
            autoFocus
            name="name"
            label="Album name"
            required
            onChange={({ target }) => {
              if (!dirtyRef.current) {
                setSlug(getURI(target.value));
              }
            }}
          />

          <TextField
            name="slug"
            label="Slug"
            value={slug}
            helperText={
              link ? (
                <span className="inline-flex flex-col">
                  <span>
                    Short name for your album. This should be unique within your
                    account.
                  </span>
                  {slug && (
                    <span>
                      <span>Your album could be accessed at</span>{' '}
                      <span className="py-1 px-2 bg-slate-100 rounded self-start">
                        {link}
                      </span>
                    </span>
                  )}
                </span>
              ) : null
            }
            onChange={({ target }) => {
              setSlug(getURI(target.value));

              if (!dirtyRef.current) {
                dirtyRef.current = true;
              }
            }}
          />

          {projectIds.map((id) => (
            <input key={id} type="hidden" name="projects" value={id} />
          ))}

          <ProjectsAutocomplete projects={projects} onChange={setProjectIds} />

          <Button variant="contained" className="self-end" type="submit">
            Create
          </Button>
        </Paper>
      </Form>
    </PageLayout>
  );
}
