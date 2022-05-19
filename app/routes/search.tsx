import { SearchOutlined } from '@mui/icons-material';
import {
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ProjectStatus } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import * as React from 'react';
import { useEffect, useState } from 'react';
import Layout from '~/modules/common/layout';
import { getFavorites } from '~/modules/favorites/get-favorites';
import { ProjectCard } from '~/modules/projects/components/project-card';
import { Projects } from '~/modules/projects/components/project-list';
import { getProjectPath } from '~/modules/projects/get-project-path';
import { getProjects } from '~/modules/projects/get-projects';
import type { FullProject } from '~/modules/projects/types/full-project';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';

type LoaderData = {
  currentUser: UserWithProfile | null;
  query: string | null;
  projects?: FullProject[];
  favouriteIds?: string[];
};

// @TODO Filter projects by query
// @TODO Implement filter by tags

export const loader: LoaderFunction = async ({ request }) => {
  const query = new URL(request.url).searchParams.get('q');

  const currentUser = await getLoggedInUser(request);

  if (!query) {
    return json<LoaderData>({ currentUser, query });
  }

  const projects = await getProjects({
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

  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    if (initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery, query]);

  const searchForm = (
    <Stack component={Form} direction="row" gap={1}>
      <TextField
        label="Search"
        name="q"
        variant="outlined"
        size="small"
        value={query}
        onChange={({ target }) => setQuery(target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchOutlined />
            </InputAdornment>
          ),
        }}
      />
      <Button type="submit" variant="outlined">
        Search
      </Button>
    </Stack>
  );

  if (!projects) {
    return (
      <Layout currentUser={currentUser} className="pt-10">
        <Stack gap={2}>
          {searchForm}
          <Typography>What would you like to look up?</Typography>
        </Stack>
      </Layout>
    );
  }

  return (
    <Layout currentUser={currentUser} className="pt-10">
      <Stack gap={2}>
        {searchForm}
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
      </Stack>
    </Layout>
  );
}
