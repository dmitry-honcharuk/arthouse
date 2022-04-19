import { styled, Typography } from '@mui/material';
import type { Project } from '@prisma/client';
import { ProjectStatus } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { z } from 'zod';
import { getUserProject } from '~/modules/projects/get-user-project';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  const { user, project: projectID } = z
    .object({
      user: z.string(),
      project: z.string(),
    })
    .parse(params);

  const [project, currentUser] = await Promise.all([
    getUserProject(user, projectID),
    getLoggedInUser(request),
  ]);

  if (!project) {
    throw new Response('Not Found', { status: 404 });
  }

  return json({
    project,
    isCurrentUser: currentUser.id === project.userId,
  });
};

const Status = styled('span')<{ status: ProjectStatus }>(
  ({ theme, status }) => ({
    backgroundColor:
      status === ProjectStatus.PUBLISHED
        ? theme.palette.primary.light
        : theme.palette.grey[300],
  })
);

export default function ProjectScreen() {
  const { project, isCurrentUser } = useLoaderData<{
    project: Project;
    isCurrentUser: boolean;
  }>();

  return (
    <div>
      <div>
        <Status status={project.status} className="capitalize p-2 rounded">
          {project.status.toLowerCase()}
        </Status>
      </div>
      <Typography variant="h3">{project.name}</Typography>
      {project.caption && (
        <>
          <Typography>{project.caption}</Typography>
        </>
      )}
    </div>
  );
}
