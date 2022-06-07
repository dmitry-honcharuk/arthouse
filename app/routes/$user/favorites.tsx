import {
  Favorite as FavoriteIcon,
  GridViewOutlined,
  PersonPin,
} from '@mui/icons-material';
import {
  FormControl,
  InputLabel,
  Link as MaterialLink,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import type { Collection, Favorite } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import * as React from 'react';
import { z } from 'zod';
import { Breadcrumbs } from '~/modules/common/breadcrumbs';
import { getCollections } from '~/modules/favorites/get-collections';
import { getFavorites } from '~/modules/favorites/get-favorites';
import type { WithCollections } from '~/modules/favorites/types/with-collections';
import { ProjectCard } from '~/modules/projects/components/project-card';
import { Projects } from '~/modules/projects/components/project-list';
import { getProjectPath } from '~/modules/projects/get-project-path';
import type { WithFullProject } from '~/modules/projects/types/with-full-project';
import { UserLayout } from '~/modules/users/components/user-layout';
import { getUserPath } from '~/modules/users/get-user-path';
import { getUserByIdentifier } from '~/modules/users/getUserById';
import { useUserOutletContext } from '~/modules/users/hooks/use-user-outlet-context';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';

type LoaderData = {
  favorites: (Favorite & WithFullProject & WithCollections)[];
  collections: Collection[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { user } = z
    .object({
      user: z.string(),
    })
    .parse(params);

  const [currentUser, requestedUser] = await Promise.all([
    getLoggedInUser(request),
    getUserByIdentifier(user),
  ]);

  if (!currentUser || currentUser.id !== requestedUser?.id) {
    throw new Response(null, { status: 404 });
  }

  const [favorites, collections] = await Promise.all([
    getFavorites(currentUser),
    getCollections(currentUser),
  ]);

  return json<LoaderData>({
    favorites,
    collections,
  });
};

export default function UserFavorites() {
  const { favorites, collections } = useLoaderData<LoaderData>();
  const { user } = useUserOutletContext();

  const [collection, setCollection] = useState<Collection | 'all'>('all');
  const showAll = collection === 'all';

  const favoritesToDisplay = showAll
    ? favorites
    : favorites.filter(({ collections }) =>
        collections.some(({ id }) => id === collection.id)
      );

  return (
    <UserLayout
      breadcrumbs={
        <Breadcrumbs
          items={[
            {
              icon: <GridViewOutlined sx={{ mr: 0.5 }} fontSize="small" />,
              label: 'Browse',
              link: '/',
            },
            {
              icon: <PersonPin sx={{ mr: 0.5 }} fontSize="small" />,
              label: user.profile?.nickname ?? null,
              link: `/${getUserPath(user)}`,
            },
            {
              icon: <FavoriteIcon sx={{ mr: 0.5 }} fontSize="small" />,
              label: 'Favorites',
            },
          ]}
        />
      }
    >
      <Stack component="main" gap={3}>
        <Typography variant="h4">Favourites</Typography>
        <FormControl>
          <InputLabel>Collection</InputLabel>
          <Select
            value={showAll ? 'all' : collection.id}
            onChange={({ target }) => {
              const selected =
                target.value === 'all'
                  ? 'all'
                  : collections.find(({ id }) => id === target.value) ?? 'all';

              setCollection(selected === 'all' ? 'all' : selected);
            }}
            input={<OutlinedInput label="Collection" />}
          >
            <MenuItem value="all">All favorites</MenuItem>
            {collections.map(({ id, name }) => (
              <MenuItem key={id} value={id}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {favoritesToDisplay.length ? (
          <Projects>
            {favoritesToDisplay.map(({ project }) => (
              <ProjectCard
                link={`/${getProjectPath(project, project.user)}`}
                key={project.id}
                project={project}
                showIsSecured
              />
            ))}
          </Projects>
        ) : (
          <Typography>
            <p>
              You didn't mark anything as your favourite
              {collection === 'all' ? (
                ''
              ) : (
                <span>
                  {' '}
                  within{' '}
                  <span className="font-bold italic">
                    {collection.name}
                  </span>{' '}
                  collection
                </span>
              )}
              .
            </p>
            <br />
            {showAll ? (
              ''
            ) : (
              <span>
                <MaterialLink
                  className="cursor-pointer"
                  onClick={() => setCollection('all')}
                >
                  Check all your favourites
                </MaterialLink>{' '}
                or{' '}
              </span>
            )}
            <MaterialLink component={Link} to="/">
              {showAll ? 'Browse' : 'browse'} all projects
            </MaterialLink>{' '}
            to find something{' '}
            {showAll ? 'you like' : 'that matches your vision'}.
          </Typography>
        )}
      </Stack>
    </UserLayout>
  );
}
