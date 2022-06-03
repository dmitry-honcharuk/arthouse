import {
  GridViewOutlined,
  PeopleAltOutlined,
  PersonPin,
} from '@mui/icons-material';
import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Link as MaterialLink,
  Stack,
  Typography,
} from '@mui/material';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import * as React from 'react';
import { z } from 'zod';
import { Breadcrumbs } from '~/modules/common/breadcrumbs';
import { GravatarAvatar } from '~/modules/common/gravatar-avatar';
import { FollowButton } from '~/modules/users/components/follow-button';
import { NicknameTag } from '~/modules/users/components/profile/nickname-tag';
import { UserLayout } from '~/modules/users/components/user-layout';
import { getFollowedUsers } from '~/modules/users/get-followed-users';
import { getUserPath } from '~/modules/users/get-user-path';
import { getUserByIdentifier } from '~/modules/users/getUserById';
import { useUserOutletContext } from '~/modules/users/hooks/use-user-outlet-context';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';

type LoaderData = {
  followedUsers: UserWithProfile[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { user } = z
    .object({
      user: z.string(),
    })
    .parse(params);

  const [currentUser, requestedUser] = await Promise.all([
    getLoggedInUser(request),
    getUserByIdentifier(user),
  ]);

  if (!currentUser || currentUser.id !== requestedUser?.id) {
    throw new Response(null, { status: 404 });
  }

  return json<LoaderData>({
    followedUsers: await getFollowedUsers(currentUser.id),
  });
};

export default function UserFollowings() {
  const { followedUsers } = useLoaderData<LoaderData>();
  const { user } = useUserOutletContext();

  return (
    <UserLayout
      breadcrumbs={
        <Breadcrumbs
          items={[
            {
              icon: <GridViewOutlined sx={{ mr: 0.5 }} fontSize="small" />,
              label: 'Browse',
              link: '/',
            },
            {
              icon: <PersonPin sx={{ mr: 0.5 }} fontSize="small" />,
              label: user.profile?.nickname ?? null,
              link: `/${getUserPath(user)}`,
            },
            {
              icon: <PeopleAltOutlined sx={{ mr: 0.5 }} fontSize="small" />,
              label: 'Following',
            },
          ]}
        />
      }
    >
      <Stack gap={3}>
        <main className="flex flex-col gap-10">
          <Typography variant="h4">Creators you follow</Typography>
        </main>
        <Stack gap={1}>
          {followedUsers.length ? (
            followedUsers.map((followedUser) => (
              <Card key={followedUser.id} variant="outlined" className="mb-3">
                <Link to={`/${getUserPath(followedUser)}`}>
                  <CardActionArea>
                    <CardContent>
                      <Stack gap={1}>
                        <Stack direction="row" alignItems="flex-end" gap={2}>
                          <GravatarAvatar email={followedUser.email} />
                          {followedUser.profile?.nickname && (
                            <NicknameTag
                              nickname={followedUser.profile.nickname}
                            />
                          )}
                        </Stack>
                        <Typography>{followedUser.email}</Typography>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Link>
                <CardActions>
                  <FollowButton userId={followedUser.id} isFollowing />
                </CardActions>
              </Card>
            ))
          ) : (
            <Typography>
              You didn't choose any creator to follow yet.
              <br />
              <Link to="/">
                <MaterialLink>Browse all projects</MaterialLink>
              </Link>{' '}
              to find something you like.
            </Typography>
          )}
        </Stack>
      </Stack>
    </UserLayout>
  );
}
