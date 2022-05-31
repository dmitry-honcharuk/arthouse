import { Avatar, Chip as MaterialChip } from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import { Link } from '@remix-run/react';
import type { FC, ReactNode } from 'react';
import * as React from 'react';

interface Props {
  label: string;
  onDelete?: () => void;
  link?: string;
  icon: ReactNode;
}

export const Chip: FC<Props> = ({ label, onDelete, link, icon }) => {
  if (!link) {
    return (
      <MaterialChip
        variant="outlined"
        avatar={<Avatar sx={{ bgcolor: blueGrey[50] }}>{icon}</Avatar>}
        label={label}
        onDelete={onDelete}
      />
    );
  }

  return (
    <MaterialChip
      variant="outlined"
      component={Link}
      to={link}
      clickable
      avatar={<Avatar sx={{ bgcolor: blueGrey[50] }}>{icon}</Avatar>}
      label={label}
      onDelete={onDelete}
    />
  );
};
