import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import { IconButton } from '@mui/material';
import { useFetcher } from '@remix-run/react';

type Props = {
  isFavorite: boolean;
  projectId: string;
};

export function FavoriteBtn({ projectId, isFavorite }: Props) {
  const fetcher = useFetcher();

  if (isFavorite) {
    return (
      <fetcher.Form method="delete" action={`/favorites/${projectId}`}>
        <IconButton type="submit">
          <ThumbUpIcon />
        </IconButton>
      </fetcher.Form>
    );
  }

  return (
    <fetcher.Form method="post" action="/favorites">
      <input type="hidden" name="projectId" value={projectId} />
      <IconButton type="submit">
        <ThumbUpOutlinedIcon />
      </IconButton>
    </fetcher.Form>
  );
}
