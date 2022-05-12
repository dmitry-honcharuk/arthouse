import { Box, Divider, Hidden, Stack } from '@mui/material';
import type { FC, ReactNode } from 'react';
import * as React from 'react';
import PageLayout from '~/modules/common/page-layout';
import { UserPersonalNavigation } from '~/modules/common/user-personal-navigation';

export const UserLayout: FC<{ breadcrumbs?: ReactNode }> = ({
  children,
  breadcrumbs,
}) => {
  return (
    <PageLayout breadcrumbs={breadcrumbs}>
      <Stack gap={2} direction={{ xs: 'column', sm: 'row' }}>
        <div>
          <UserPersonalNavigation />
        </div>

        <Hidden smDown>
          <Divider orientation="vertical" flexItem variant="middle" />
        </Hidden>

        <Box flexGrow={1} paddingY={2}>
          {children}
        </Box>
      </Stack>
    </PageLayout>
  );
};
