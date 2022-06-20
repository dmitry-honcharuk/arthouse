import {
  PeopleAltOutlined,
  SpeedOutlined,
  WhatshotOutlined,
} from '@mui/icons-material';
import { Box, Stack, Tab, Tabs } from '@mui/material';
import type { Category } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData, useNavigate } from '@remix-run/react';
import { useState } from 'react';
import { CategoriesAutocomplete } from '~/modules/categories/components/categories-autocomplete';
import { CategoryChip } from '~/modules/categories/components/category-chip';
import { getCategories } from '~/modules/categories/get-categories';
import Layout from '~/modules/common/layout';
import { getFavorites } from '~/modules/favorites/get-favorites';
import { ProjectCard } from '~/modules/projects/components/project-card';
import { Projects } from '~/modules/projects/components/project-list';
import { DashboardView } from '~/modules/projects/dashboard/dashboard-view';
import { getProjectsForDashboard } from '~/modules/projects/dashboard/get-projects-for-dashboard';
import { isDashboardView } from '~/modules/projects/dashboard/is-dashboard-view';
import { getProjectPath } from '~/modules/projects/get-project-path';
import type { FullProject } from '~/modules/projects/types/full-project';
import { getFollowedUsers } from '~/modules/users/get-followed-users';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';

interface LoaderData {
  currentUser: UserWithProfile | null;
  projects: FullProject[];
  favouriteIds: string[];
  view: DashboardView;
  allCategories: Category[];
  selectedCategories: Category[];
  isFollowing: boolean;
}

export const loader: LoaderFunction = async ({ request }) => {
  const viewQuery =
    new URL(request.url).searchParams.get('view') ?? DashboardView.Trending;
  const view = isDashboardView(viewQuery) ? viewQuery : DashboardView.Trending;
  const categoriesSearch = new URL(request.url).searchParams.getAll(
    'categories'
  );

  const categoryIds = categoriesSearch
    .filter(Boolean)
    .map(Number)
    .filter((c) => !Number.isNaN(c));

  try {
    const currentUser = await getLoggedInUser(request);

    const [favorites, projects, allCategories, followedUsers] =
      await Promise.all([
        currentUser ? getFavorites(currentUser.id) : [],
        getProjectsForDashboard({
          view,
          categories: categoryIds,
          ...(currentUser && { user: currentUser }),
        }),
        getCategories(),
        currentUser ? getFollowedUsers(currentUser.id) : [],
      ]);

    const selectedCategories = allCategories.filter(({ id }) =>
      categoryIds.includes(id)
    );

    return json<LoaderData>({
      currentUser,
      favouriteIds: favorites.map(({ projectId }) => projectId),
      projects,
      view,
      allCategories,
      selectedCategories,
      isFollowing: followedUsers.length !== 0,
    });
  } catch (error) {
    return json<LoaderData>({
      currentUser: null,
      projects: [],
      favouriteIds: [],
      view,
      allCategories: [],
      selectedCategories: [],
      isFollowing: false,
    });
  }
};

export default function Dashboard() {
  const {
    currentUser,
    projects,
    favouriteIds,
    view,
    allCategories,
    selectedCategories,
    isFollowing,
  } = useLoaderData<LoaderData>();

  const [tab, setTab] = useState(view);

  const navigate = useNavigate();

  return (
    <Layout currentUser={currentUser}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 2, sm: 0 }}
        justifyContent="space-between"
        alignItems={{ xs: 'stratch', sm: 'center' }}
      >
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          aria-label="tabs"
        >
          <Tab
            icon={<WhatshotOutlined />}
            to={{
              search: getPageParams({
                view: DashboardView.Trending,
                categories: selectedCategories.map(({ id }) => id),
              }).toString(),
            }}
            component={Link}
            value={DashboardView.Trending}
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
                view: DashboardView.Latest,
                categories: selectedCategories.map(({ id }) => id),
              }).toString(),
            }}
            component={Link}
            value={DashboardView.Latest}
            iconPosition="start"
            label="Latest"
            sx={{
              '&.MuiButtonBase-root': {
                justifyContent: 'flex-end',
              },
            }}
          />
          {currentUser && isFollowing && (
            <Tab
              icon={<PeopleAltOutlined />}
              to={{
                search: getPageParams({
                  view: DashboardView.Following,
                  categories: selectedCategories.map(({ id }) => id),
                }).toString(),
              }}
              component={Link}
              value={DashboardView.Following}
              iconPosition="start"
              label="Following"
              sx={{
                '&.MuiButtonBase-root': {
                  justifyContent: 'flex-end',
                },
              }}
            />
          )}
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
  view,
  categories,
}: {
  view?: DashboardView;
  categories?: number[];
}): URLSearchParams {
  const params = new URLSearchParams();

  if (view) {
    params.set('view', view);
  }

  categories?.forEach((c) => params.append('categories', `${c}`));

  return params;
}
