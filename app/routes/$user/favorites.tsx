import {
  CollectionsBookmarkOutlined,
  Favorite as FavoriteIcon,
  FolderCopyOutlined,
  GridViewOutlined,
  PersonPin,
} from '@mui/icons-material';
import { Stack, Tab, Tabs } from '@mui/material';
import type { Collection, Favorite } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import * as React from 'react';
import { useState } from 'react';
import { z } from 'zod';
import { Breadcrumbs } from '~/modules/common/breadcrumbs';
import { ProjectsView } from '~/modules/favorites/components/favorites-screen/projects-view';
import { getCollections } from '~/modules/favorites/get-collections';
import { getFavorites } from '~/modules/favorites/get-favorites';
import type { WithCollections } from '~/modules/favorites/types/with-collections';
import type { WithFullProject } from '~/modules/projects/types/with-full-project';
import { UserLayout } from '~/modules/users/components/user-layout';
import { getUserPath } from '~/modules/users/get-user-path';
import { getUserByIdentifier } from '~/modules/users/getUserById';
import { useUserOutletContext } from '~/modules/users/hooks/use-user-outlet-context';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';

enum Section {
  Projects = 'projects',
  Collections = 'collections',
}

type LoaderData = {
  favorites: (Favorite & WithFullProject & WithCollections)[];
  collections: Collection[];
  section: Section;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const { user } = z
    .object({
      user: z.string(),
    })
    .parse(params);

  const sectionQuery = new URL(request.url).searchParams.get('section');

  const section =
    sectionQuery && Object.values(Section).includes(sectionQuery as Section)
      ? (sectionQuery as Section)
      : Section.Projects;

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
    section,
  });
};

export default function UserFavorites() {
  const { favorites, collections, section } = useLoaderData<LoaderData>();

  const { user } = useUserOutletContext();

  const [tab, setTab] = useState(section);

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
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          aria-label="tabs"
          variant="fullWidth"
        >
          <Tab
            icon={<FolderCopyOutlined />}
            iconPosition="start"
            to={{
              search: new URLSearchParams({
                section: Section.Projects,
              }).toString(),
            }}
            component={Link}
            value={Section.Projects}
            label="Projects"
          />
          <Tab
            icon={<CollectionsBookmarkOutlined />}
            iconPosition="start"
            to={{
              search: new URLSearchParams({
                section: Section.Collections,
              }).toString(),
            }}
            component={Link}
            value={Section.Collections}
            label="Collections"
          />
        </Tabs>
        {tab === Section.Projects && (
          <ProjectsView collections={collections} favorites={favorites} />
        )}
      </Stack>
    </UserLayout>
  );
}
