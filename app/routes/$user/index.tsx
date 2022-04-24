import { AddBoxOutlined } from '@mui/icons-material';
import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  styled,
  Typography,
} from '@mui/material';
import type { Project } from '@prisma/client';
import { ProjectStatus } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { z } from 'zod';
import { prisma } from '~/db.server';
import { getProjectPath } from '~/modules/projects/get-project-path';
import { getUserByIdentifier } from '~/modules/users/getUserById';
import { requireUser } from '~/server/require-user.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  const { user: userIdentifier } = z
    .object({
      user: z.string(),
    })
    .parse(params);

  const [currentUser, user] = await Promise.all([
    requireUser(request),
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
        {projects.map(({ id, name, caption, slug, status, preview }) => (
          <Card elevation={3} key={id}>
            <Link
              to={`${getProjectPath({ id, slug })}`}
              className="block h-full"
            >
              <CardActionArea
                sx={{ alignItems: 'normal' }}
                className="h-full flex-col relative"
              >
                {isCurrentUser && (
                  <div className="flex justify-end absolute right-0 top-2">
                    <Status
                      status={status}
                      className="text-center capitalize font-bold text-sm py-1 px-2 rounded-l-sm"
                    >
                      <Typography
                        sx={{ fontSize: 14 }}
                        color={
                          status === ProjectStatus.PUBLISHED
                            ? 'primary.contrastText'
                            : 'text.secondary'
                        }
                      >
                        {status.toLowerCase()}
                      </Typography>
                    </Status>
                  </div>
                )}
                {preview && (
                  <CardMedia
                    component="img"
                    sx={{ height: 200 }}
                    image={preview}
                    alt="Paella dish"
                  />
                )}
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {name}
                  </Typography>
                  {caption && (
                    <Typography variant="body2" color="text.secondary">
                      {caption}
                    </Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Link>
          </Card>
        ))}
      </Projects>
    </div>
  );
}

const Status = styled('div')<{ status: ProjectStatus }>(
  ({ theme, status }) => ({
    backgroundColor:
      status === ProjectStatus.PUBLISHED
        ? theme.palette.primary.light
        : theme.palette.grey[300],
  })
);

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
