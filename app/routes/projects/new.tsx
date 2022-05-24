import {
  AddBoxOutlined,
  GridViewOutlined,
  PersonPin,
} from '@mui/icons-material';
import { Button, Paper, TextField, Typography } from '@mui/material';
import type { Category } from '@prisma/client';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { CategoriesAutocompleteField } from '~/modules/categories/components/categories-autocomplete-field';
import { getCategories } from '~/modules/categories/get-categories';
import { Breadcrumbs } from '~/modules/common/breadcrumbs';
import PageLayout from '~/modules/common/page-layout';
import { getURI } from '~/modules/common/utils/getURI';
import { createProject } from '~/modules/projects/create-project';
import { getProjectPath } from '~/modules/projects/get-project-path';
import { getUserPath } from '~/modules/users/get-user-path';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import { ActionBuilder } from '~/server/action-builder.server';
import { FormDataHandler } from '~/server/form-data-handler.server';
import { requireLoggedInUser } from '~/server/require-logged-in-user.server';

interface LoaderData {
  currentUser: UserWithProfile;
  categories: Category[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const [currentUser, categories] = await Promise.all([
    requireLoggedInUser(request),
    getCategories(),
  ]);

  return json<LoaderData>({
    currentUser,
    categories,
  });
};

export const action: ActionFunction = async (actionDetails) => {
  return new ActionBuilder(actionDetails)
    .use('POST', async ({ request }) => {
      const user = await requireLoggedInUser(request);
      const formDataHandler = new FormDataHandler(request);

      const { name, caption, slug, categories } =
        await formDataHandler.validate(
          z.object({
            name: z.string().nonempty('Name is required'),
            caption: z.string().optional(),
            slug: z.string().optional(),
            categories: z.array(z.string()).optional(),
          })
        );

      const project = await createProject(user.id, {
        name,
        caption: caption || null,
        slug: slug || null,
        categories: categories
          ?.filter(Boolean)
          .map(Number)
          .filter((id) => !Number.isNaN(id)),
      });

      return redirect(getProjectPath(project, user));
    })
    .build();
};

export default function NewProject() {
  const { currentUser, categories } = useLoaderData<LoaderData>();
  const actionData = useActionData<{ name: string[] }>();
  const [slug, setSlug] = useState('');
  const dirtyRef = useRef(false);

  const [link, setLink] = useState('');

  useEffect(() => {
    setLink(`${location.host}/${getUserPath(currentUser)}/${slug}`);
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
              label: 'Project',
            },
          ]}
        />
      }
    >
      <Form method="post" className="flex flex-col gap-4 max-w-2xl">
        <Typography variant="h3">Create new project</Typography>

        <Paper className="p-4 flex flex-col gap-3" elevation={3}>
          <TextField
            autoFocus
            name="name"
            label="Project name"
            error={!!actionData?.name}
            helperText={actionData?.name}
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
                    Short name for your project. This should be unique within
                    your account.
                  </span>
                  {slug && (
                    <span>
                      <span>Your project could be accessed at</span>{' '}
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
          <TextField multiline name="caption" label="Description" />

          <CategoriesAutocompleteField allCategories={categories} />

          <Button variant="contained" className="self-end" type="submit">
            Create
          </Button>
        </Paper>
      </Form>
    </PageLayout>
  );
}
