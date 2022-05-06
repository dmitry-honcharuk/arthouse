import { Typography } from '@mui/material';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import * as React from 'react';
import { z } from 'zod';
import { UserPersonalNavigation } from '~/modules/common/user-personal-navigation';
import { getUserByIdentifier } from '~/modules/users/getUserById';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';
import Layout from '~/modules/common/layout';
import { Box } from '@mui/system';
import { ProjectCard } from '~/modules/projects/components/project-card';
import { getProjectPath } from '~/modules/projects/get-project-path';
import { useLoaderData } from '@remix-run/react';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import type { Favorite } from '@prisma/client';
import type { WithFullProject } from '~/modules/projects/types/with-full-project';
import { getFavorites } from '~/modules/favorites/get-favorites';

type LoaderData = {
  currentUser: UserWithProfile;
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

  return json({
    favorites,
    currentUser,
  });
};

export default function UserFavorites() {
  const { favorites, currentUser } = useLoaderData<LoaderData>();

  return (
    <>
      <UserPersonalNavigation />
      <main className="flex flex-col gap-10">
        <Typography variant="h4">Favourites</Typography>
      </main>
      <Layout currentUser={currentUser}>
        <Box className="flex items-center gap-4">
          {favorites.map(({ project }) => (
            <ProjectCard
              link={`/${getProjectPath(project, project.user)}`}
              key={project.id}
              project={project}
            />
          ))}
        </Box>
      </Layout>
    </>
  );
}
