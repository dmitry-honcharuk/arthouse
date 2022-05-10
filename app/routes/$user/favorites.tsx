import {
  Favorite as FavoriteIcon,
  GridViewOutlined,
  PersonPin,
} from '@mui/icons-material';
import { Link as MaterialLink, Stack, Typography } from '@mui/material';
import type { Favorite } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import * as React from 'react';
import { z } from 'zod';
import { Breadcrumbs } from '~/modules/common/breadcrumbs';
import { getFavorites } from '~/modules/favorites/get-favorites';
import { ProjectCard } from '~/modules/projects/components/project-card';
import { Projects } from '~/modules/projects/components/project-list';
import { getProjectPath } from '~/modules/projects/get-project-path';
import type { WithFullProject } from '~/modules/projects/types/with-full-project';
import { UserLayout } from '~/modules/users/components/user-layout';
import { getUserPath } from '~/modules/users/get-user-path';
import { getUserByIdentifier } from '~/modules/users/getUserById';
import { useUserOutletContext } from '~/modules/users/hooks/use-user-outlet-context';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';

type LoaderData = {
  favorites: (Favorite & WithFullProject)[];
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

  const favorites = await getFavorites(currentUser.id);

  return json<LoaderData>({
    favorites,
  });
};

export default function UserFavorites() {
  const { favorites } = useLoaderData<LoaderData>();
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
              icon: <FavoriteIcon sx={{ mr: 0.5 }} fontSize="small" />,
              label: 'Favorites',
            },
          ]}
        />
      }
    >
      <Stack gap={3}>
        <main className="flex flex-col gap-10">
          <Typography variant="h4">Favourites</Typography>
        </main>
        {favorites.length ? (
          <Projects>
            {favorites.map(({ project }) => (
              <ProjectCard
                link={`/${getProjectPath(project, project.user)}`}
                key={project.id}
                project={project}
                showIsSecured
              />
            ))}
          </Projects>
        ) : (
          <Typography>
            You didn't mark anything as your favourite.
            <br />
            <Link to="/">
              <MaterialLink>Browse all projects</MaterialLink>
            </Link>{' '}
            to find something you like.
          </Typography>
        )}
      </Stack>
    </UserLayout>
  );
}
