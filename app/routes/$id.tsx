import { Typography } from '@mui/material';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import type { UserPayload } from '~/modules/auth/jwt';
import { requireUser } from '~/server/require-user';

export const loader: LoaderFunction = async ({ request }) => {
  return json(await requireUser(request));
};

export default function UserProfile() {
  const user = useLoaderData<UserPayload>();

  return (
    <div className="pt-36 flex justify-center">
      <div>
        <Typography variant="h3">Hello there,</Typography>
        <Typography variant="h4">{user.email}</Typography>

        <Form action="/logout" method="post">
          <button type="submit">Logout</button>
        </Form>
      </div>
    </div>
  );
}
