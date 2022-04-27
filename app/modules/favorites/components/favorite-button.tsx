import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import { IconButton } from '@mui/material';
import { useFetcher } from '@remix-run/react';

type Props = {
  isFavorite: boolean;
};

export function FavoriteBtn({ isFavorite }: Props) {
  const fetcher = useFetcher();

  if (isFavorite) {
    return (
      <fetcher.Form method="delete">
        <input type="hidden" name="projectId" />
        <IconButton type="submit">
          <ThumbUpIcon />
        </IconButton>
      </fetcher.Form>
    );
  }

  return (
    <fetcher.Form method="post">
      <input type="hidden" name="projectId" />
      <IconButton type="submit">
        <ThumbUpOutlinedIcon />
      </IconButton>
    </fetcher.Form>
  );
}
