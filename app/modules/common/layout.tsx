import { styled } from '@mui/material/styles';
import * as React from 'react';
import { Header } from '~/modules/common/header';
import { SIDEBAR_WIDTH } from '~/modules/users/components/user-page/sidebar';
import type { UserWithProfile } from '~/modules/users/types/social-user';

interface Props {
  sidebar?: React.ReactNode;
  currentUser: UserWithProfile;
}

export default function Layout({
  sidebar,
  currentUser,
  children,
}: React.PropsWithChildren<Props>) {
  return (
    <>
      <Header user={currentUser} />
      <div className="pt-16">
        <Content>{children}</Content>
      </div>
      {sidebar && (
        <div className="hidden md:block fixed right-4 top-32">{sidebar}</div>
      )}
    </>
  );
}

const Content = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),

  [theme.breakpoints.up('md')]: {
    width: `calc(100% - ${SIDEBAR_WIDTH}px - ${theme.spacing(2)})`,
  },
}));
