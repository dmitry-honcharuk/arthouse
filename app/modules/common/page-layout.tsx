import { Box } from '@mui/material';
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
      {breadcrumbs && <Box marginBottom={5}>{breadcrumbs}</Box>}
      {children}
    </Box>
  );
}
