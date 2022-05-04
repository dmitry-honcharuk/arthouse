import { Save } from '@mui/icons-material';
import { Button, TextField } from '@mui/material';
import { Album } from '@prisma/client';
import { Form } from '@remix-run/react';
import * as React from 'react';
import { FC } from 'react';

export const AlbumTitleForm: FC<{
  onSubmit: () => void;
  onCancel: () => void;
  album: Album;
}> = ({ onSubmit, onCancel, album }) => {
  return (
    <Form method="put" className="flex gap-2 items-center" onSubmit={onSubmit}>
      <input type="hidden" name="fields" value="name" />
      <TextField
        autoFocus
        variant="outlined"
        label="Name"
        name="name"
        defaultValue={album.name}
      />
      <div className="flex justify-end gap-2 items-center">
        <Button
          variant="outlined"
          type="button"
          size="small"
          color="inherit"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          variant="outlined"
          type="submit"
          startIcon={<Save />}
          size="small"
        >
          Update
        </Button>
      </div>
    </Form>
  );
};
