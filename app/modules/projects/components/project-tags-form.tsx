import { AddBoxOutlined } from '@mui/icons-material';
import {
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { Project } from '@prisma/client';
import { useFetcher } from '@remix-run/react';
import { orderBy } from 'lodash';
import type { FC } from 'react';
import * as React from 'react';
import { useRef, useState } from 'react';
import { TagChip } from '~/modules/tags/components/tag-chip';
import type { WithTags } from '~/modules/tags/types/with-tags';

type Props = {
  project: Project & WithTags;
  action: string;
  isCurrentUser: boolean;
  isEdit: boolean;
};

export const ProjectTagsForm: FC<Props> = ({
  project,
  action,
  isCurrentUser,
  isEdit,
}) => {
  const fetcher = useFetcher();
  const formRef = useRef<HTMLFormElement>(null);

  const [tag, setTag] = useState('');

  const tagDisplay = project.tags.length ? (
    <Stack direction="row" gap={1} flexWrap="wrap">
      {orderBy(project.tags, ['name'], ['asc']).map(({ name }) => (
        <TagChip
          key={name}
          tag={name}
          link={!isEdit ? `/search?tags=${name}` : undefined}
          onDelete={
            isCurrentUser && isEdit
              ? () => {
                  const formData = new FormData();

                  formData.set('fields', 'tags');

                  project.tags
                    .filter((tag) => tag.name !== name)
                    .forEach((tag) => formData.append('tags', tag.name));

                  fetcher.submit(formData, { method: 'put', action });
                }
              : undefined
          }
        />
      ))}
    </Stack>
  ) : (
    <Typography color="dimgray">No tags specified</Typography>
  );

  if (!isEdit) {
    return tagDisplay;
  }

  const pending = fetcher.state !== 'idle';

  return (
    <fetcher.Form
      ref={formRef}
      method="put"
      action={action}
      onSubmit={() => {
        setTag('');
      }}
    >
      <input type="hidden" name="fields" value="tags" />

      {project.tags.map(({ name }) => (
        <input key={name} type="hidden" name="tags" value={name} />
      ))}

      {tag && <input type="hidden" name="tags" value={tag} />}

      <Stack spacing={2}>
        {tagDisplay}
        {isCurrentUser && (
          <TextField
            autoFocus
            size="small"
            label="new tag"
            value={tag}
            onChange={({ target }) => setTag(target.value.toLowerCase().trim())}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    type="submit"
                    size="small"
                    edge="end"
                    disabled={!tag || pending}
                  >
                    {pending ? (
                      <CircularProgress color="inherit" size={16} />
                    ) : (
                      <AddBoxOutlined />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
      </Stack>
    </fetcher.Form>
  );
};
