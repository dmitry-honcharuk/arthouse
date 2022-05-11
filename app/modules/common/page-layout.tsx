import { Box, styled } from '@mui/material';
import type { ReactNode } from 'react';
import * as React from 'react';

interface Props {
  breadcrumbs?: ReactNode;
}

export default function PageLayout({
  breadcrumbs,
  children,
}: React.PropsWithChildren<Props>) {
  return (
    <Box paddingTop={2}>
      {breadcrumbs && <Breadcrumbs>{breadcrumbs}</Breadcrumbs>}
      {children}
    </Box>
  );
}

const Breadcrumbs = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(2),

  [theme.breakpoints.up('sm')]: {
    marginBottom: theme.spacing(5),
  },
}));
