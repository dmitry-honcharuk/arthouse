import { Typography } from '@mui/material';
import { ProjectStatus } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import * as React from 'react';
import { getFavorites } from '~/modules/favorites/get-favorites';
import { ProjectCard } from '~/modules/projects/components/project-card';
import { Projects } from '~/modules/projects/components/project-list';
import { getProjectPath } from '~/modules/projects/get-project-path';
import { getProjects } from '~/modules/projects/get-projects';
import type { FullProject } from '~/modules/projects/types/full-project';
import { SearchPageLayout } from '~/modules/search/components/search-page-layout';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';

type LoaderData = {
  currentUser: UserWithProfile | null;
  query: string | null;
  projects?: FullProject[];
  favouriteIds?: string[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const query = new URL(request.url).searchParams.get('q');

  const currentUser = await getLoggedInUser(request);

  if (!query) {
    return json<LoaderData>({ currentUser, query });
  }

  const projects = await getProjects({
    name: query,
    statuses: [ProjectStatus.PUBLISHED],
    isSecure: false,
  });

  const favorites = currentUser ? await getFavorites(currentUser.id) : [];

  return json<LoaderData>({
    currentUser,
    favouriteIds: favorites.map(({ projectId }) => projectId),
    projects,
    query,
  });
};

export default function SearchPage() {
  const {
    currentUser,
    projects,
    favouriteIds,
    query: initialQuery,
  } = useLoaderData<LoaderData>();

  if (!projects) {
    return (
      <SearchPageLayout currentUser={currentUser} initialQuery={initialQuery}>
        <Typography>What would you like to look up?</Typography>
      </SearchPageLayout>
    );
  }

  if (!projects.length) {
    return (
      <SearchPageLayout currentUser={currentUser} initialQuery={initialQuery}>
        <Typography>
          ¯\_(ツ)_/¯ Nothing was found to satisfy your request.
        </Typography>
        <Typography>Try again</Typography>
      </SearchPageLayout>
    );
  }

  return (
    <SearchPageLayout currentUser={currentUser} initialQuery={initialQuery}>
      <Projects>
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            link={getProjectPath(project, project.user)}
            showFavourite={favouriteIds?.includes(project.id)}
          />
        ))}
      </Projects>
    </SearchPageLayout>
  );
}
