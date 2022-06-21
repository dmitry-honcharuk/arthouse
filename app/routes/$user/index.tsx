import {
  AddBoxOutlined,
  FolderCopyOutlined,
  GridViewOutlined,
  PersonPin,
} from '@mui/icons-material';
import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  FormControl,
  InputLabel,
  Link as MaterialLink,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import type { Album, Project } from '@prisma/client';
import { ProjectStatus } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import invariant from 'tiny-invariant';
import { z } from 'zod';
import { getAlbumPath } from '~/modules/albums/get-album-path';
import { getUserAlbums } from '~/modules/albums/get-user-albums';
import { Breadcrumbs } from '~/modules/common/breadcrumbs';
import { GravatarAvatar } from '~/modules/common/gravatar-avatar';
import { getFavorites } from '~/modules/favorites/get-favorites';
import { ProjectCard } from '~/modules/projects/components/project-card';
import { Projects } from '~/modules/projects/components/project-list';
import { getProjectPath } from '~/modules/projects/get-project-path';
import { getProjects } from '~/modules/projects/get-projects';
import type { WithProjects } from '~/modules/projects/types/with-projects';
import { FollowButton } from '~/modules/users/components/follow-button';
import { NicknameTag } from '~/modules/users/components/profile/nickname-tag';
import { UserLayout } from '~/modules/users/components/user-layout';
import { getUserByIdentifier } from '~/modules/users/getUserById';
import { isFollowing } from '~/modules/users/is-following';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import type { WithUser } from '~/modules/users/types/with-user';
import { getFullName } from '~/modules/users/utils/get-full-name';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';

type FullAlbum = Album & WithProjects & WithUser;

interface LoaderData {
  isCurrentUser: boolean;
  currentUser: UserWithProfile | null;
  projects: (Project & WithUser)[];
  favouriteIds: string[];
  albums: FullAlbum[];
  user: UserWithProfile;
  following: boolean;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { user: userIdentifier } = z
    .object({
      user: z.string(),
    })
    .parse(params);

  const [currentUser, user] = await Promise.all([
    getLoggedInUser(request),
    getUserByIdentifier(userIdentifier),
  ]);

  invariant(user, `Invalid user identifier ${userIdentifier}`);

  const isCurrentUser = currentUser?.id === user.id;

  const showExplicit = isCurrentUser
    ? true
    : currentUser?.showExplicit ?? false;

  const [projects, albums, favorites, following] = await Promise.all([
    getProjects({
      userId: user.id,
      statuses: isCurrentUser
        ? [ProjectStatus.DRAFT, ProjectStatus.PUBLISHED]
        : [ProjectStatus.PUBLISHED],
      ...(!isCurrentUser && { isSecure: false }),
      ...(!showExplicit && { explicit: false }),
    }),
    getUserAlbums(user.id, {
      ...(!isCurrentUser && {
        project: {
          isSecure: false,
          ...(!showExplicit && { explicit: false }),
        },
        albums: { isSecure: false },
      }),
    }),
    currentUser ? getFavorites(currentUser.id) : [],
    currentUser && !isCurrentUser
      ? isFollowing({ userId: user.id, followerId: currentUser.id })
      : false,
  ]);

  return json<LoaderData>({
    projects,
    favouriteIds: favorites.map(({ projectId }) => projectId),
    isCurrentUser,
    currentUser,
    albums: isCurrentUser
      ? albums
      : albums.filter(({ projects }) => !!projects.length),
    user,
    following,
  });
};

export default function UserProjects() {
  const {
    projects,
    isCurrentUser,
    albums,
    favouriteIds,
    user,
    currentUser,
    following,
  } = useLoaderData<LoaderData>();

  const [selectedAlbum, setSelectedAlbum] = useState<FullAlbum | 'all'>('all');

  const showAll = selectedAlbum === 'all';

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
            },
            {
              icon: <FolderCopyOutlined sx={{ mr: 0.5 }} fontSize="small" />,
              label: 'Projects',
            },
          ]}
        />
      }
    >
      <Stack gap={3}>
        {currentUser && !isCurrentUser && (
          <Card variant="outlined" className="mb-3">
            <CardContent>
              <Stack gap={1}>
                <Stack direction="row" alignItems="center" gap={2}>
                  <GravatarAvatar email={user.email} />
                  {user.profile && (
                    <Stack alignItems="flex-start">
                      <Typography>{getFullName(user.profile)}</Typography>

                      {user.profile.nickname && (
                        <NicknameTag nickname={user.profile.nickname} />
                      )}
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </CardContent>
            <CardActions>
              <FollowButton userId={user.id} isFollowing={following} />
            </CardActions>
          </Card>
        )}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <div className="flex items-center gap-2">
            {showAll ? (
              <Typography variant="h4">All projects</Typography>
            ) : (
              <MaterialLink
                component={Link}
                variant="h4"
                color="inherit"
                to={`/${getAlbumPath(selectedAlbum, selectedAlbum.user)}`}
              >
                {selectedAlbum.name}
              </MaterialLink>
            )}
          </div>

          {isCurrentUser && (
            <Link to="/albums/new" className="block h-full">
              <Button variant="outlined" startIcon={<AddBoxOutlined />}>
                Album
              </Button>
            </Link>
          )}
        </Stack>
        <FormControl>
          <InputLabel>Album</InputLabel>
          <Select
            value={showAll ? 'all' : selectedAlbum.id}
            onChange={({ target }) => {
              const selected =
                target.value === 'all'
                  ? 'all'
                  : albums.find(({ id }) => id === target.value);

              setSelectedAlbum(selected!);
            }}
            input={<OutlinedInput label="Album" />}
          >
            <MenuItem value="all">All projects</MenuItem>
            {albums.map(({ id, name }) => (
              <MenuItem key={id} value={id}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Projects>
          {isCurrentUser && (
            <Card sx={{ minHeight: 200 }} variant="outlined">
              <Link to="/projects/new" className="block h-full">
                <CardActionArea className="flex h-full items-center">
                  <Typography
                    color="primary"
                    className="flex items-center gap-1 justify-center text-lg"
                  >
                    <AddBoxOutlined />
                    <span>New Project</span>
                  </Typography>
                </CardActionArea>
              </Link>
            </Card>
          )}

          {(showAll ? projects : selectedAlbum.projects).map(
            ({ user, ...project }) => {
              return (
                <ProjectCard
                  link={getProjectPath(project)}
                  key={project.id}
                  showStatus={isCurrentUser}
                  showIsSecured={isCurrentUser}
                  showFavourite={favouriteIds.includes(project.id)}
                  project={project}
                />
              );
            }
          )}
        </Projects>
      </Stack>
    </UserLayout>
  );
}
