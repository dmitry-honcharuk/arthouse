import { AddBoxOutlined } from '@mui/icons-material';
import {
  Button,
  Card,
  CardActionArea,
  FormControl,
  InputLabel,
  Link as MaterialLink,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from '@mui/material';
import type { Album, Project } from '@prisma/client';
import { ProjectStatus } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import * as React from 'react';
import { useState } from 'react';
import invariant from 'tiny-invariant';
import { z } from 'zod';
import { prisma } from '~/db.server';
import { getAlbumPath } from '~/modules/albums/get-album-path';
import { getUserAlbums } from '~/modules/albums/get-user-albums';
import { UserPersonalNavigation } from '~/modules/common/user-personal-navigation';
import { ProjectCard } from '~/modules/projects/components/project-card';
import { Projects } from '~/modules/projects/components/project-list';
import { getProjectPath } from '~/modules/projects/get-project-path';
import type { WithProjects } from '~/modules/projects/types/with-projects';
import { getUserByIdentifier } from '~/modules/users/getUserById';
import type { WithUser } from '~/modules/users/types/with-user';
import { getSessionUser } from '~/server/get-session.user.server';

type FullAlbum = Album & WithProjects & WithUser;

interface LoaderData {
  isCurrentUser: boolean;
  projects: (Project & WithUser)[];
  albums: FullAlbum[];
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
      ...(!isCurrentUser && { isSecure: false }),
    },
    include: {
      user: { include: { profile: true } },
    },
  });

  const albums = await getUserAlbums(user.id, {
    ...(!isCurrentUser && { isSecure: false }),
  });

  return json<LoaderData>({
    projects,
    isCurrentUser,
    albums: albums.filter(({ projects }) => !!projects.length),
  });
};

export default function UserProjects() {
  const { projects, isCurrentUser, albums } = useLoaderData<LoaderData>();

  const [selectedAlbum, setSelectedAlbum] = useState<FullAlbum | 'all'>('all');

  const showAll = selectedAlbum === 'all';

  return (
    <>
      <UserPersonalNavigation />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showAll ? (
            <Typography variant="h4">All projects</Typography>
          ) : (
            <MaterialLink
              component={Link}
              variant="h4"
              color="inherit"
              to={`/${getAlbumPath(selectedAlbum, selectedAlbum.user)}`}
            >
              {selectedAlbum.name}
            </MaterialLink>
          )}
        </div>

        {isCurrentUser && (
          <Link to="/albums/new" className="block h-full">
            <Button variant="outlined" startIcon={<AddBoxOutlined />}>
              Album
            </Button>
          </Link>
        )}
      </div>
      <FormControl>
        <InputLabel id="demo-multiple-name-label">Album</InputLabel>
        <Select
          labelId="demo-multiple-name-label"
          id="demo-multiple-name"
          value={showAll ? 'all' : selectedAlbum.id}
          onChange={({ target }) => {
            const selected =
              target.value === 'all'
                ? 'all'
                : albums.find(({ id }) => id === target.value);

            setSelectedAlbum(selected!);
          }}
          input={<OutlinedInput label="Name" />}
        >
          <MenuItem value="all">All projects</MenuItem>
          {albums.map(({ id, name }) => (
            <MenuItem key={id} value={id}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
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

        {(showAll ? projects : selectedAlbum.projects).map(
          ({ user, ...project }) => {
            return (
              <ProjectCard
                link={getProjectPath(project)}
                key={project.id}
                showStatus={isCurrentUser}
                showIsSecured={isCurrentUser}
                project={project}
              />
            );
          }
        )}
      </Projects>
    </>
  );
}
