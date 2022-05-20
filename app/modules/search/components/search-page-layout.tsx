import { Stack } from '@mui/material';
import * as React from 'react';
import type { FC } from 'react';
import Layout from '~/modules/common/layout';
import { SearchForm } from '~/modules/search/components/search-form';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';

export const SearchPageLayout: FC<{
  currentUser: UserWithProfile | null;
  initialQuery: string | null;
}> = ({ children, currentUser, initialQuery }) => {
  return (
    <Layout currentUser={currentUser} className="pt-10">
      <Stack gap={7}>
        <div className="self-center">
          <SearchForm initialQuery={initialQuery} />
        </div>
        <main>{children}</main>
      </Stack>
    </Layout>
  );
};
