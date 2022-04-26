import cn from 'classnames';
import * as React from 'react';
import { Header } from '~/modules/common/header';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';

interface Props {
  className?: string;
  currentUser: UserWithProfile | null;
}

export default function Layout({
  className,
  currentUser,
  children,
}: React.PropsWithChildren<Props>) {
  return (
    <>
      <Header user={currentUser} />
      <div className={cn('px-8', className)}>{children}</div>
    </>
  );
}
