import { styled } from '@mui/material/styles';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import * as React from 'react';
import { Header } from '~/modules/common/header';
import {
  SIDEBAR_WIDTH,
  UserPageSidebar,
} from '~/modules/users/components/user-page/sidebar';
import { getUserById } from '~/modules/users/getUserById';
import type { UserWithProfile } from '~/modules/users/types/social-user';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    const { id } = params;

    const [user, currentUser] = await Promise.all([
      getUserById(id!),
      getLoggedInUser(request),
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

const Content = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  width: `calc(100% - ${SIDEBAR_WIDTH}px - ${theme.spacing(2)})`,
}));

export default function UserProfile() {
  const { user, currentUser } = useLoaderData<{
    user: UserWithProfile;
    currentUser: UserWithProfile;
  }>();

  return (
    <>
      <Header user={currentUser} />
      <Content>
        <Outlet context={{ user, isCurrentUser: user.id === currentUser.id }} />
      </Content>
      <div className="fixed right-4 top-32">
        <UserPageSidebar />
      </div>
    </>
  );
}
