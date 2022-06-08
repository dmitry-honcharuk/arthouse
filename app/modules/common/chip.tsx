import { Avatar, Chip as MaterialChip } from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import { Link } from '@remix-run/react';
import type { FC, ReactNode } from 'react';
import * as React from 'react';

interface Props {
  label: string;
  onDelete?: React.EventHandler<any>;
  link?: string;
  icon?: ReactNode;
}

export const Chip: FC<Props> = ({ label, onDelete, link, icon }) => {
  const avatar = icon ? (
    <Avatar sx={{ bgcolor: blueGrey[50] }}>{icon}</Avatar>
  ) : undefined;

  if (!link) {
    return (
      <MaterialChip
        variant="outlined"
        avatar={avatar}
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
      avatar={avatar}
      label={label}
      onDelete={onDelete}
    />
  );
};
