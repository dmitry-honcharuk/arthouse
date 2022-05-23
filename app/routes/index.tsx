import { SpeedOutlined, WhatshotOutlined } from '@mui/icons-material';
import { Tab, Tabs } from '@mui/material';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import * as React from 'react';
import { useState } from 'react';
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

export enum Priority {
  Trending = 'trending',
  Latest = 'latest',
}

interface LoaderData {
  currentUser: UserWithProfile | null;
  projects: FullProject[];
  favouriteIds: string[];
  sorting: DashboardSorting;
}

export const loader: LoaderFunction = async ({ request }) => {
  const sortingQuery =
    new URL(request.url).searchParams.get('sort') ?? DashboardSorting.Trending;
  const sorting = isDashboardSorting(sortingQuery)
    ? sortingQuery
    : DashboardSorting.Trending;

  try {
    const currentUser = await getLoggedInUser(request);

    const favorites = currentUser ? await getFavorites(currentUser.id) : [];

    return json<LoaderData>({
      currentUser,
      favouriteIds: favorites.map(({ projectId }) => projectId),
      projects: await getProjectsForDashboard(sorting),
      sorting,
    });
  } catch (error) {
    return json<LoaderData>({
      currentUser: null,
      projects: [],
      favouriteIds: [],
      sorting,
    });
  }
};

export default function Dashboard() {
  const { currentUser, projects, favouriteIds, sorting } =
    useLoaderData<LoaderData>();

  const [tab, setTab] = useState(sorting);

  return (
    <Layout currentUser={currentUser}>
      <Tabs
        value={tab}
        onChange={(_, newValue) => setTab(newValue)}
        aria-label="icon position tabs example"
      >
        <Tab
          icon={<WhatshotOutlined />}
          to={`/?sort=${DashboardSorting.Trending}`}
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
          to={`/?sort=${DashboardSorting.Latest}`}
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
