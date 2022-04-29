import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import * as React from 'react';
import Layout from '~/modules/common/layout';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';

export const loader: LoaderFunction = async ({ request }) => {
  const currentUser = await getLoggedInUser(request);

  return json({
    currentUser,
  });
};

export default function UserProjects() {
  const { currentUser } = useLoaderData<{
    currentUser: UserWithProfile;
  }>();

  return (
    <Layout currentUser={currentUser}>
      <Outlet />
    </Layout>
  );
}
