import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import * as React from 'react';
import Layout from '~/modules/common/layout';
import { UserPageSidebar } from '~/modules/users/components/user-page/sidebar';
import { getUserByIdentifier } from '~/modules/users/getUserById';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import { requireLoggedInUser } from '~/server/require-logged-in-user.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    const { user: userId } = params;

    const [user, currentUser] = await Promise.all([
      getUserByIdentifier(userId!),
      requireLoggedInUser(request),
    ]);

    if (!user) {
      throw new Response('Not Found', { status: 404 });
    }

    return json({
      user,
      currentUser: currentUser as UserWithProfile,
    });
  } catch (error) {
    throw new Response('Not Found', { status: 404 });
  }
};

export default function UserProfile() {
  const { user, currentUser } = useLoaderData<{
    user: UserWithProfile;
    currentUser: UserWithProfile;
  }>();

  return (
    <Layout currentUser={currentUser} sidebar={<UserPageSidebar />}>
      <Outlet context={{ user, isCurrentUser: user.id === currentUser.id }} />
    </Layout>
  );
}
