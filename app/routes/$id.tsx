import { Typography } from '@mui/material';
import type { LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { UserPayload } from '~/modules/auth/jwt';
import { verifyUserToken } from '~/modules/auth/jwt';
import { destroySession, getSession } from '~/sessions';

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'));

  if (!session) {
    return redirect('/authenticate');
  }

  const user = verifyUserToken(session.get('user-token'));

  if (!user) {
    return redirect('/authenticate', {
      headers: {
        'Set-Cookie': await destroySession(session),
      },
    });
  }

  return json(user);
};

export default function UserProfile() {
  const user = useLoaderData<UserPayload>();

  return (
    <div className="pt-36 flex justify-center">
      <div>
        <Typography variant="h3">Hello there,</Typography>
        <Typography variant="h4">{user.email}</Typography>
      </div>
    </div>
  );
}
