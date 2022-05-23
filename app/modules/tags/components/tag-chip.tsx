import { TagOutlined } from '@mui/icons-material';
import { Avatar, Chip } from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import { Link } from '@remix-run/react';
import type { FC } from 'react';
import * as React from 'react';

interface Props {
  tag: string;
  onDelete?: () => void;
  link?: string;
}

export const TagChip: FC<Props> = ({ tag, onDelete, link }) => {
  if (!link) {
    return (
      <Chip
        variant="outlined"
        avatar={
          <Avatar sx={{ bgcolor: blueGrey[50] }}>
            <TagOutlined sx={{ fontSize: '1rem' }} />
          </Avatar>
        }
        label={tag}
        onDelete={onDelete}
      />
    );
  }

  return (
    <Chip
      variant="outlined"
      component={Link}
      to={link}
      clickable
      avatar={
        <Avatar sx={{ bgcolor: blueGrey[50] }}>
          <TagOutlined sx={{ fontSize: '1rem' }} />
        </Avatar>
      }
      label={tag}
      onDelete={onDelete}
    />
  );
};
