import { GridViewOutlined } from '@mui/icons-material';
import type { FC } from 'react';
import * as React from 'react';
import { Chip } from '~/modules/common/chip';

interface Props {
  category: string;
  onDelete?: () => void;
  link?: string;
}

export const CategoryChip: FC<Props> = ({ category, onDelete, link }) => {
  return (
    <Chip
      icon={<GridViewOutlined sx={{ fontSize: '1rem' }} />}
      label={category}
      onDelete={onDelete}
      link={link}
    />
  );
};
