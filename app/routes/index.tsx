import { Box } from '@mui/system';
import { ProjectStatus } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import * as React from 'react';
import Layout from '~/modules/common/layout';
import { ProjectCard } from '~/modules/projects/components/project-card';
import { getProjectPath } from '~/modules/projects/get-project-path';
import { getProjects } from '~/modules/projects/get-projects';
import type { FullProject } from '~/modules/projects/types/full-project';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const [currentUser, projects] = await Promise.all([
      getLoggedInUser(request),
      getProjects({ statuses: [ProjectStatus.PUBLISHED] }),
    ]);

    return json({ currentUser, projects });
  } catch (error) {
    return json({ currentUser: null });
  }
};

export default function UserProfile() {
  const { currentUser, projects } = useLoaderData<{
    currentUser: UserWithProfile | null;
    projects: FullProject[];
  }>();

  return (
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
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            link={getProjectPath(project, project.user)}
          />
        ))}
      </Box>
    </Layout>
  );
}
