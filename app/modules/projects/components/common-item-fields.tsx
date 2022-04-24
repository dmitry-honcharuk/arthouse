import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField,
} from '@mui/material';
import type { ProjectItem } from '@prisma/client';
import type { FC } from 'react';
import { useToggle } from '../../common/hooks/use-toggle';

export const CommonItemFields: FC<{ item?: ProjectItem }> = ({ item }) => {
  const [withTitle, toggleWithTitle] = useToggle(!!item?.title);
  const [withCaption, toggleWithCaption] = useToggle(!!item?.caption);

  return (
    <>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              name="with-title"
              onChange={() => toggleWithTitle()}
              defaultChecked={!!item?.title}
            />
          }
          label="With Title"
        />
        {withTitle && (
          <TextField
            label="Title"
            name="title"
            autoFocus
            defaultValue={item?.title}
          />
        )}
      </FormGroup>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              name="with-caption"
              onChange={() => toggleWithCaption()}
              defaultChecked={!!item?.caption}
            />
          }
          label="With Caption"
        />
        {withCaption && (
          <TextField
            label="Caption"
            name="caption"
            autoFocus
            defaultValue={item?.caption}
          />
        )}
      </FormGroup>
    </>
  );
};
