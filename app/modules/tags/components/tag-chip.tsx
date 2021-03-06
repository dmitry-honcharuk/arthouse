import { TagOutlined } from '@mui/icons-material';
import type { FC } from 'react';
import * as React from 'react';
import { Chip } from '~/modules/common/chip';

interface Props {
  tag: string;
  onDelete?: () => void;
  link?: string;
}

export const TagChip: FC<Props> = ({ tag, onDelete, link }) => {
  return (
    <Chip
      icon={<TagOutlined sx={{ fontSize: '1rem' }} />}
      label={tag}
      onDelete={onDelete}
      link={link}
    />
  );
};
