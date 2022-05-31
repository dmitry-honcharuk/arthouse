import { SpeedOutlined, WhatshotOutlined } from '@mui/icons-material';
import { Box, Stack, Tab, Tabs } from '@mui/material';
import type { Category } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData, useNavigate } from '@remix-run/react';
import * as React from 'react';
import { useState } from 'react';
import { CategoriesAutocomplete } from '~/modules/categories/components/categories-autocomplete';
import { CategoryChip } from '~/modules/categories/components/category-chip';
import { getCategories } from '~/modules/categories/get-categories';
import Layout from '~/modules/common/layout';
import { getFavorites } from '~/modules/favorites/get-favorites';
import { ProjectCard } from '~/modules/projects/components/project-card';
import { Projects } from '~/modules/projects/components/project-list';
import { DashboardSorting } from '~/modules/projects/dashboard/dashboard-sorting';
import { getProjectsForDashboard } from '~/modules/projects/dashboard/get-projects-for-dashboard';
import { isDashboardSorting } from '~/modules/projects/dashboard/is-dashboard-sorting';
import { getProjectPath } from '~/modules/projects/get-project-path';
import type { FullProject } from '~/modules/projects/types/full-project';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';

interface LoaderData {
  currentUser: UserWithProfile | null;
  projects: FullProject[];
  favouriteIds: string[];
  sorting: DashboardSorting;
  allCategories: Category[];
  selectedCategories: Category[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const sortingQuery =
    new URL(request.url).searchParams.get('sort') ?? DashboardSorting.Trending;
  const sorting = isDashboardSorting(sortingQuery)
    ? sortingQuery
    : DashboardSorting.Trending;
  const categoriesSearch = new URL(request.url).searchParams.getAll(
    'categories'
  );

  const categoryIds = categoriesSearch
    .filter(Boolean)
    .map(Number)
    .filter((c) => !Number.isNaN(c));

  try {
    const currentUser = await getLoggedInUser(request);

    const [favorites, projects, allCategories] = await Promise.all([
      currentUser ? getFavorites(currentUser.id) : [],
      getProjectsForDashboard({ sorting, categories: categoryIds }),
      getCategories(),
    ]);

    const selectedCategories = allCategories.filter(({ id }) =>
      categoryIds.includes(id)
    );

    return json<LoaderData>({
      currentUser,
      favouriteIds: favorites.map(({ projectId }) => projectId),
      projects,
      sorting,
      allCategories,
      selectedCategories,
    });
  } catch (error) {
    return json<LoaderData>({
      currentUser: null,
      projects: [],
      favouriteIds: [],
      sorting,
      allCategories: [],
      selectedCategories: [],
    });
  }
};

export default function Dashboard() {
  const {
    currentUser,
    projects,
    favouriteIds,
    sorting,
    allCategories,
    selectedCategories,
  } = useLoaderData<LoaderData>();

  const [tab, setTab] = useState(sorting);

  const navigate = useNavigate();

  return (
    <Layout currentUser={currentUser}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          aria-label="icon position tabs example"
        >
          <Tab
            icon={<WhatshotOutlined />}
            to={{
              search: getPageParams({
                sort: DashboardSorting.Trending,
                categories: selectedCategories.map(({ id }) => id),
              }).toString(),
            }}
            component={Link}
            value={DashboardSorting.Trending}
            iconPosition="start"
            label="Trending"
            sx={{
              '&.MuiButtonBase-root': {
                justifyContent: 'flex-end',
              },
            }}
          />
          <Tab
            icon={<SpeedOutlined />}
            to={{
              search: getPageParams({
                sort: DashboardSorting.Latest,
                categories: selectedCategories.map(({ id }) => id),
              }).toString(),
            }}
            component={Link}
            value={DashboardSorting.Latest}
            iconPosition="start"
            label="Latest"
            sx={{
              '&.MuiButtonBase-root': {
                justifyContent: 'flex-end',
              },
            }}
          />
        </Tabs>
        <Box minWidth={200}>
          <CategoriesAutocomplete
            allCategories={allCategories}
            selectedCategories={selectedCategories}
            limitTags={1}
            renderTags={(categories) =>
              categories.length ? (
                <CategoryChip category={`${categories.length}`} />
              ) : null
            }
            onChange={(categories) => {
              const params = new URLSearchParams(location.search);

              params.delete('categories');

              categories.forEach(({ id }) =>
                params.append('categories', `${id}`)
              );

              navigate({
                search: params.toString(),
              });
            }}
          />
        </Box>
      </Stack>
      <Projects className="mt-10">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            link={getProjectPath(project, project.user)}
            showFavourite={favouriteIds.includes(project.id)}
          />
        ))}
      </Projects>
    </Layout>
  );
}

function getPageParams({
  sort,
  categories,
}: {
  sort?: DashboardSorting;
  categories?: number[];
}): URLSearchParams {
  const params = new URLSearchParams();

  if (sort) {
    params.set('sort', sort);
  }

  categories?.forEach((c) => params.append('categories', `${c}`));

  return params;
}
