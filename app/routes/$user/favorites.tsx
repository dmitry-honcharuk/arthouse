import { Typography } from '@mui/material';
import type { Favorite } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import * as React from 'react';
import { z } from 'zod';
import { UserPersonalNavigation } from '~/modules/common/user-personal-navigation';
import { getFavorites } from '~/modules/favorites/get-favorites';
import { ProjectCard } from '~/modules/projects/components/project-card';
import { Projects } from '~/modules/projects/components/project-list';
import { getProjectPath } from '~/modules/projects/get-project-path';
import type { WithFullProject } from '~/modules/projects/types/with-full-project';
import { getUserByIdentifier } from '~/modules/users/getUserById';
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

  return (
    <>
      <UserPersonalNavigation />
      <main className="flex flex-col gap-10">
        <Typography variant="h4">Favourites</Typography>
      </main>
      <Projects>
        {favorites.map(({ project }) => (
          <ProjectCard
            link={`/${getProjectPath(project, project.user)}`}
            key={project.id}
            project={project}
          />
        ))}
      </Projects>
    </>
  );
}
