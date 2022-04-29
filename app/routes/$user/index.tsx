import {
  AddBoxOutlined,
  FavoriteBorderOutlined,
  Shop2Outlined,
} from '@mui/icons-material';
import { TabContext, TabPanel } from '@mui/lab';
import {
  Button,
  Card,
  CardActionArea,
  styled,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import type { Project } from '@prisma/client';
import { ProjectStatus } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import * as React from 'react';
import { useState } from 'react';
import invariant from 'tiny-invariant';
import { z } from 'zod';
import { prisma } from '~/db.server';
import { ProjectCard } from '~/modules/projects/components/project-card';
import { getProjectPath } from '~/modules/projects/get-project-path';
import { getUserByIdentifier } from '~/modules/users/getUserById';
import type { WithUser } from '~/modules/users/types/with-user';
import { getSessionUser } from '~/server/get-session.user.server';

interface LoaderData {
  isCurrentUser: boolean;
  projects: (Project & WithUser)[];
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const { user: userIdentifier } = z
    .object({
      user: z.string(),
    })
    .parse(params);

  const [currentUser, user] = await Promise.all([
    getSessionUser(request),
    getUserByIdentifier(userIdentifier),
  ]);

  invariant(user, `Invalid user identifier ${userIdentifier}`);

  const isCurrentUser = currentUser?.id === user.id;

  const projects = await prisma.project.findMany({
    where: {
      status: isCurrentUser
        ? { in: [ProjectStatus.DRAFT, ProjectStatus.PUBLISHED] }
        : ProjectStatus.PUBLISHED,
      userId: user.id,
    },
    include: {
      user: { include: { profile: true } },
    },
  });

  return json<LoaderData>({ projects, isCurrentUser });
};

export default function UserProjects() {
  const { projects, isCurrentUser } = useLoaderData<LoaderData>();

  const [value, setValue] = useState('all');

  return (
    <TabContext value={value}>
      <div className="flex gap-2 items-start">
        <div className="grow">
          <TabPanel value="favourites">Favourites</TabPanel>
          <TabPanel value="all">
            <div className="flex flex-col gap-4">
              <Projects>
                {isCurrentUser && (
                  <Card sx={{ minHeight: 200 }} variant="outlined">
                    <Link to="/projects/new" className="block h-full">
                      <CardActionArea className="flex h-full items-center">
                        <Typography
                          color="primary"
                          className="flex items-center gap-1 justify-center text-lg"
                        >
                          <AddBoxOutlined />
                          <span>New Project</span>
                        </Typography>
                      </CardActionArea>
                    </Link>
                  </Card>
                )}

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
          </TabPanel>
        </div>

        <div className="shrink-0 flex flex-col gap-4">
          <Tabs
            value={value}
            onChange={(_, newValue) => setValue(newValue)}
            orientation="vertical"
            aria-label="icon position tabs example"
            sx={{ borderRight: 1, borderColor: 'divider' }}
            variant="scrollable"
          >
            <Tab
              icon={<FavoriteBorderOutlined />}
              value="favourites"
              iconPosition="end"
              label="favourites"
            />
            <Tab
              icon={<Shop2Outlined />}
              value="all"
              iconPosition="end"
              label="all projects"
            />
          </Tabs>
          <Button startIcon={<AddBoxOutlined />} variant="outlined">
            New Album (Impl)
          </Button>
        </div>
      </div>
    </TabContext>
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
