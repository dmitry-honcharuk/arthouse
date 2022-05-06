import { FavoriteBorderOutlined, FavoriteOutlined } from '@mui/icons-material';
import { Button } from '@mui/material';
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
        <Button
          variant="contained"
          type="submit"
          color="secondary"
          size="large"
          fullWidth
        >
          <FavoriteOutlined />
        </Button>
      </fetcher.Form>
    );
  }

  return (
    <fetcher.Form method="post" action="/favorites">
      <input type="hidden" name="projectId" value={projectId} />
      <Button type="submit" color="secondary" size="large" fullWidth>
        <FavoriteBorderOutlined />
      </Button>
    </fetcher.Form>
  );
}
