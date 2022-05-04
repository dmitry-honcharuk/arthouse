import { EditOutlined } from '@mui/icons-material';
import { Button } from '@mui/material';
import * as React from 'react';
import type { FC } from 'react';

export const EditButton: FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Button
      variant="outlined"
      startIcon={<EditOutlined />}
      size="small"
      onClick={onClick}
    >
      Edit
    </Button>
  );
};
