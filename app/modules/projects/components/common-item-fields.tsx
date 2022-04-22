import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField,
} from '@mui/material';
import type { FC } from 'react';
import { useToggle } from '../../common/hooks/use-toggle';

export const CommonItemFields: FC = () => {
  const [withTitle, toggleWithTitle] = useToggle();
  const [withCaption, toggleWithCaption] = useToggle();

  return (
    <>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox name="with-title" onChange={() => toggleWithTitle()} />
          }
          label="With Title"
        />
        {withTitle && <TextField label="Title" name="title" autoFocus />}
      </FormGroup>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              name="with-caption"
              onChange={() => toggleWithCaption()}
            />
          }
          label="With Caption"
        />
        {withCaption && <TextField label="Caption" name="caption" autoFocus />}
      </FormGroup>
    </>
  );
};
