import { AddBoxOutlined } from '@mui/icons-material';
import { Button, styled } from '@mui/material';
import type { Project } from '@prisma/client';
import { ProjectStatus } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { z } from 'zod';
import { prisma } from '~/db.server';
import { ProjectCard } from '~/modules/projects/components/project-card';
import { getProjectPath } from '~/modules/projects/get-project-path';
import { getUserByIdentifier } from '~/modules/users/getUserById';
import { requireSessionUser } from '~/server/require-session-user.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  const { user: userIdentifier } = z
    .object({
      user: z.string(),
    })
    .parse(params);

  const [currentUser, user] = await Promise.all([
    requireSessionUser(request),
    getUserByIdentifier(userIdentifier),
  ]);

  invariant(user, `Invalid user identifier ${userIdentifier}`);

  const isCurrentUser = currentUser.id === user.id;

  const projects = await prisma.project.findMany({
    where: {
      status: isCurrentUser
        ? { in: [ProjectStatus.DRAFT, ProjectStatus.PUBLISHED] }
        : ProjectStatus.PUBLISHED,
      userId: user.id,
    },
  });

  return json({ projects, isCurrentUser });
};

export default function UserProjects() {
  const { projects, isCurrentUser } = useLoaderData<{
    projects: Project[];
    isCurrentUser: boolean;
  }>();

  return (
    <div className="flex flex-col gap-4">
      {isCurrentUser && (
        <>
          <Link to="/projects/new" className="self-end">
            <Button startIcon={<AddBoxOutlined />}>New Project</Button>
          </Link>
        </>
      )}

      <Projects>
        {projects.map((project) => (
          <ProjectCard
            link={getProjectPath(project)}
            key={project.id}
            isCurrentUser={isCurrentUser}
            project={project}
          />
        ))}
      </Projects>
    </div>
  );
}

const Projects = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),

  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },

  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
}));
