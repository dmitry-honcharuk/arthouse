import {
  Breadcrumbs as MuiBreadcrumbs,
  Link as MuiLink,
  Typography,
} from '@mui/material';
import { Link } from '@remix-run/react';
import type { FC, ReactNode } from 'react';
import * as React from 'react';

interface BreadcrumbItem {
  link?: string;
  label?: ReactNode;
  icon: ReactNode;
}

interface Props {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: FC<Props> = ({ items }) => {
  return (
    <div role="presentation">
      <MuiBreadcrumbs aria-label="breadcrumb">
        {items.map(({ icon, label, link }, index) =>
          link ? (
            <MuiLink
              key={link ?? index}
              component={Link}
              to={link}
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center' }}
              color="inherit"
            >
              {icon}
              {label}
            </MuiLink>
          ) : (
            <Typography
              key={index}
              sx={{ display: 'flex', alignItems: 'center' }}
              color="text.primary"
            >
              {icon}
              {label}
            </Typography>
          )
        )}
      </MuiBreadcrumbs>
    </div>
  );
};
