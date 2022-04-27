import React from 'react';
import { getFavorites } from '~/modules/favorites/get-favorites';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getProjectPath } from '~/modules/projects/get-project-path';
import { ProjectCard } from '~/modules/projects/components/project-card';
import { requireSessionUser } from '~/server/require-session-user.server';
import type { Favorite } from '@prisma/client';
import type { WithFullProject } from '~/modules/projects/types/with-full-project';
import Layout from '~/modules/common/layout';
import { Box } from '@mui/system';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';

type LoaderData = {
  currentUser: UserWithProfile;
  favorites: (Favorite & WithFullProject)[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const currentUser = await requireSessionUser(request);
  const favorites = await getFavorites(currentUser.id);

  return json<LoaderData>({
    currentUser,
    favorites,
  });
};

export default function Favorites() {
  const { favorites, currentUser } = useLoaderData<LoaderData>();

  return (
    <>
      <Layout currentUser={currentUser}>
        <Box
          sx={(theme) => ({
            gridTemplateColumns: 'repeat(2, 1fr)',

            [theme.breakpoints.up('sm')]: {
              gridTemplateColumns: 'repeat(3, 1fr)',
            },

            [theme.breakpoints.up('md')]: {
              gridTemplateColumns: 'repeat(4, 1fr)',
            },

            [theme.breakpoints.up('lg')]: {
              gridTemplateColumns: 'repeat(5, 1fr)',
            },
          })}
          className="grid gap-4 pt-28"
        >
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
