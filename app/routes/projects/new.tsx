import { Button, Paper, TextField, Typography } from '@mui/material';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import * as React from 'react';
import { z } from 'zod';
import { createProject } from '~/modules/projects/create-project';
import { getProjectPath } from '~/modules/projects/get-project-path';
import { getUserPath } from '~/modules/users/get-user-path';
import { getURI } from '~/modules/users/getURI';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import { validateFormData } from '~/modules/validation/validate-form-data';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';

export const loader: LoaderFunction = async ({ request }) => {
  return json({
    currentUser: await getLoggedInUser(request),
  });
};

export const action: ActionFunction = async ({ request }) => {
  const [user, formData] = await Promise.all([
    getLoggedInUser(request),
    request.formData(),
  ]);

  const { name, caption, slug } = validateFormData(
    formData,
    z.object({
      name: z.string().nonempty(),
      caption: z.string().optional(),
      slug: z.string().optional(),
    })
  );

  const project = await createProject(user.id, {
    name,
    caption: caption || null,
    slug: slug || null,
  });

  return redirect(getProjectPath(project, user));
};

export default function NewProject() {
  const { currentUser } = useLoaderData<{ currentUser: UserWithProfile }>();
  const [slug, setSlug] = React.useState('');
  const dirtyRef = React.useRef(false);

  const [link, setLink] = React.useState('');

  React.useEffect(() => {
    setLink(`${location.host}/${getUserPath(currentUser)}/${slug}`);
  }, [currentUser, slug]);

  return (
    <Form method="post" className="flex flex-col gap-4 max-w-2xl">
      <Typography variant="h3">Create new project</Typography>

      <Paper className="p-4 flex flex-col gap-3" elevation={3}>
        <TextField
          autoFocus
          name="name"
          label="Project name"
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
                  Short name for your project. This should be unique within your
                  account.
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
        <TextField name="caption" label="Description" />

        <Button variant="contained" className="self-end" type="submit">
          Create
        </Button>
      </Paper>
    </Form>
  );
}
