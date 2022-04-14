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
import type { UserWithProfile } from '~/modules/users/types/social-user';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getLoggedInUser(request);

  return json(user as UserWithProfile);
};

const Content = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  width: `calc(100% - ${SIDEBAR_WIDTH}px - ${theme.spacing(2)})`,
}));

export default function UserProfile() {
  const user = useLoaderData<UserWithProfile>();

  return (
    <>
      <Header user={user} />
      <Content>
        <Outlet context={user} />
      </Content>
      <div className="fixed right-4 top-32">
        <UserPageSidebar />
      </div>
    </>
  );
}
