import { Typography } from '@mui/material';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import * as React from 'react';
import { z } from 'zod';
import { UserPersonalNavigation } from '~/modules/common/user-personal-navigation';
import { getUserByIdentifier } from '~/modules/users/getUserById';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  const { user } = z
    .object({
      user: z.string(),
    })
    .parse(params);

  const [loggedUser, requestedUser] = await Promise.all([
    getLoggedInUser(request),
    getUserByIdentifier(user),
  ]);

  if (!loggedUser || loggedUser.id !== requestedUser?.id) {
    throw new Response(null, { status: 404 });
  }

  return json({});
};

export default function UserFavorites() {
  return (
    <>
      <UserPersonalNavigation />
      <main className="flex flex-col gap-10">
        <Typography variant="h4">Favourites</Typography>
      </main>
    </>
  );
}
