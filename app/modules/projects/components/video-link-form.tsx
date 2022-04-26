import { Button, TextField } from '@mui/material';
import type { ProjectItem } from '@prisma/client';
import { ProjectItemType } from '@prisma/client';
import { useFetcher } from '@remix-run/react';
import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import { YoutubeFrame } from '~/modules/common/youtube-frame';
import { CommonItemFields } from './common-item-fields';

interface Props {
  onSuccess: () => void;
  onCancel?: () => void;
  item?: ProjectItem;
}

export const VideoLinkForm: FC<Props> = ({ item, onSuccess, onCancel }) => {
  const fetcher = useFetcher();
  const formRef = useRef<HTMLFormElement>(null);

  const [url, setUrl] = useState(item?.value ?? '');

  useEffect(() => {
    if (fetcher.type === 'done' && fetcher.data) {
      onSuccess();
    }
  }, [fetcher.data, fetcher.type, onSuccess]);

  return (
    <fetcher.Form
      ref={formRef}
      method={item ? 'put' : 'post'}
      action={item?.id}
      className="flex flex-col gap-3 w-full h-full"
    >
      <input type="hidden" name="type" value={ProjectItemType.YOUTUBE} />

      <TextField
        label="Video link"
        name="url"
        defaultValue={item?.value ?? ''}
        onPaste={(event) => setUrl(event.clipboardData.getData('text'))}
        onBlur={({ target }) => setUrl(target.value)}
      />

      {url && <YoutubeFrame title="new item" url={url} />}

      <CommonItemFields item={item} />

      <div className="flex gap-2 justify-end">
        <Button type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" className="self-end">
          {item ? 'Update slide' : 'Add slide'}
        </Button>
      </div>
    </fetcher.Form>
  );
};
