import { Typography } from '@mui/material';
import type { Category } from '@prisma/client';
import { ProjectStatus } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import * as React from 'react';
import { getCategories } from '~/modules/categories/get-categories';
import { getFavorites } from '~/modules/favorites/get-favorites';
import { ProjectCard } from '~/modules/projects/components/project-card';
import { Projects } from '~/modules/projects/components/project-list';
import { getProjectPath } from '~/modules/projects/get-project-path';
import { getProjects } from '~/modules/projects/get-projects';
import type { FullProject } from '~/modules/projects/types/full-project';
import { SearchPageLayout } from '~/modules/search/components/search-page-layout';
import { normalizeTags } from '~/modules/tags/normalize-tags';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';

type LoaderData = {
  currentUser: UserWithProfile | null;
  query: string | null;
  tags: string[];
  categories: Category[];
  allCategories: Category[];
  projects?: FullProject[];
  favouriteIds?: string[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const query = new URL(request.url).searchParams.get('q');
  const tagsSearch = new URL(request.url).searchParams.getAll('tags');
  const categoriesSearch = new URL(request.url).searchParams.getAll(
    'categories'
  );

  const tags = normalizeTags(tagsSearch);
  const categoryIds = categoriesSearch
    .filter(Boolean)
    .map(Number)
    .filter((c) => !Number.isNaN(c));

  const [currentUser, allCategories] = await Promise.all([
    getLoggedInUser(request),
    getCategories(),
  ]);

  const categories = allCategories.filter(({ id }) => categoryIds.includes(id));

  if (!query && !tags.length && !categoriesSearch.length) {
    return json<LoaderData>({
      currentUser,
      query,
      tags,
      categories,
      allCategories,
    });
  }

  const projects = await getProjects({
    ...(query && { name: query }),
    ...(tags.length && { tags }),
    ...(categoriesSearch.length && {
      categories: categoryIds,
    }),
    statuses: [ProjectStatus.PUBLISHED],
    isSecure: false,
  });

  const favorites = currentUser ? await getFavorites(currentUser.id) : [];

  return json<LoaderData>({
    currentUser,
    favouriteIds: favorites.map(({ projectId }) => projectId),
    projects,
    query,
    tags,
    categories,
    allCategories,
  });
};

export default function SearchPage() {
  const {
    currentUser,
    projects,
    favouriteIds,
    query: initialQuery,
    tags,
    categories,
    allCategories,
  } = useLoaderData<LoaderData>();

  if (!projects) {
    return (
      <SearchPageLayout
        currentUser={currentUser}
        initialQuery={initialQuery}
        tags={tags}
        categories={categories}
        allCategories={allCategories}
      >
        <Typography>What would you like to look up?</Typography>
      </SearchPageLayout>
    );
  }

  if (!projects.length) {
    return (
      <SearchPageLayout
        currentUser={currentUser}
        initialQuery={initialQuery}
        tags={tags}
        categories={categories}
        allCategories={allCategories}
      >
        <Typography>
          ¯\_(ツ)_/¯ Nothing was found to satisfy your request.
        </Typography>
        <Typography>Try again</Typography>
      </SearchPageLayout>
    );
  }

  return (
    <SearchPageLayout
      currentUser={currentUser}
      initialQuery={initialQuery}
      tags={tags}
      categories={categories}
      allCategories={allCategories}
    >
      <Projects>
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            link={`/${getProjectPath(project, project.user)}`}
            showFavourite={favouriteIds?.includes(project.id)}
          />
        ))}
      </Projects>
    </SearchPageLayout>
  );
}
