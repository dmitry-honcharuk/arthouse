import { PersonAddOutlined, PersonRemoveOutlined } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useFetcher } from '@remix-run/react';

type Props = {
  userId: string;
  isFollowing: boolean;
};

export function FollowButton({ userId, isFollowing }: Props) {
  const fetcher = useFetcher();

  const action = `/follows/${userId}`;

  if (isFollowing) {
    return (
      <fetcher.Form method="delete" action={action}>
        <Button
          type="submit"
          startIcon={<PersonRemoveOutlined />}
          variant="outlined"
          color="inherit"
        >
          Unfollow
        </Button>
      </fetcher.Form>
    );
  }

  return (
    <fetcher.Form method="post" action={action}>
      <Button
        type="submit"
        startIcon={<PersonAddOutlined />}
        variant="outlined"
      >
        Follow
      </Button>
    </fetcher.Form>
  );
}
