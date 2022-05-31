import { Divider, Stack } from '@mui/material';
import type { Category } from '@prisma/client';
import type { FC } from 'react';
import * as React from 'react';
import Layout from '~/modules/common/layout';
import { SearchForm } from '~/modules/search/components/search-form';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';

export const SearchPageLayout: FC<{
  currentUser: UserWithProfile | null;
  initialQuery: string | null;
  tags: string[];
  categories: Category[];
  allCategories: Category[];
}> = ({
  children,
  currentUser,
  initialQuery,
  tags,
  categories,
  allCategories,
}) => {
  return (
    <Layout currentUser={currentUser} className="pt-10">
      <Stack gap={7}>
        <div className="self-center">
          <SearchForm
            initialQuery={initialQuery}
            tags={tags}
            categories={categories}
            allCategories={allCategories}
          />
        </div>
        <Divider />
        <main>{children}</main>
      </Stack>
    </Layout>
  );
};
