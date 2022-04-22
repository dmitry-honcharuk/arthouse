import { Button, TextField } from '@mui/material';
import type { ProjectItem } from '@prisma/client';
import { ProjectItemType } from '@prisma/client';
import { Form, useActionData } from '@remix-run/react';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { YoutubeFrame } from '~/modules/common/youtube-frame';
import { CommonItemFields } from './common-item-fields';

interface Props {
  onSuccess: (item: ProjectItem) => void;
}

export const VideoLinkForm: FC<Props> = ({ onSuccess }) => {
  const action = useActionData<ProjectItem>();

  const [url, setUrl] = useState('');

  useEffect(() => {
    if (action) {
      onSuccess(action);
    }
  }, [action, onSuccess]);

  return (
    <Form method="post" className="flex flex-col gap-3 w-full h-full">
      <input type="hidden" name="type" value={ProjectItemType.YOUTUBE} />

      <TextField
        label="Vido link"
        name="url"
        onPaste={(event) => setUrl(event.clipboardData.getData('text'))}
        onBlur={({ target }) => setUrl(target.value)}
      />

      {url && <YoutubeFrame title="new item" url={url} />}

      <CommonItemFields />

      <Button type="submit" variant="contained" className="self-end">
        Add video
      </Button>
    </Form>
  );
};
