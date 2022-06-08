import {
  FolderCopyOutlined,
  FolderOutlined,
  GridViewOutlined,
  PersonPin,
} from '@mui/icons-material';
import type { Album, Category, Collection, Favorite } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import * as React from 'react';
import { z } from 'zod';
import { getAlbumPath } from '~/modules/albums/get-album-path';
import { getUserAlbum } from '~/modules/albums/get-user-album';
import { getCategories } from '~/modules/categories/get-categories';
import type { WithCategories } from '~/modules/categories/types/with-categories';
import { Breadcrumbs } from '~/modules/common/breadcrumbs';
import { countFavourites } from '~/modules/favorites/count-favourites';
import { getCollections } from '~/modules/favorites/get-collections';
import { getFavorites } from '~/modules/favorites/get-favorites';
import { findFavorite } from '~/modules/favorites/helpers/find-favorite';
import type { WithCollections } from '~/modules/favorites/types/with-collections';
import { ProjectScreen } from '~/modules/projects/components/project-screen';
import { getUserProject } from '~/modules/projects/get-user-project';
import type { ProjectWithItems } from '~/modules/projects/types/project-with-items';
import type { WithProjectSecurity } from '~/modules/projects/types/with-project-security';
import type { WithTags } from '~/modules/tags/types/with-tags';
import { getUserPath } from '~/modules/users/get-user-path';
import { getUserByIdentifier } from '~/modules/users/getUserById';
import { isFollowing } from '~/modules/users/is-following';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import type { WithUser } from '~/modules/users/types/with-user';
import { getAlbumAuthSession } from '~/server/album-auth-session.server';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';

interface LoaderData {
  isCurrentUser: boolean;
  project: ProjectWithItems &
    WithUser &
    WithProjectSecurity &
    WithTags &
    WithCategories;
  currentUser: UserWithProfile | null;
  favorite: null | (Favorite & WithCollections);
  favouritesCount: number;
  album: Album;
  categories: Category[];
  following: boolean;
  allCollections: Collection[];
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const {
    user: userID,
    album: albumID,
    project: projectID,
  } = z
    .object({
      album: z.string(),
      project: z.string(),
      user: z.string(),
    })
    .parse(params);

  const [user, currentUser] = await Promise.all([
    getUserByIdentifier(userID),
    getLoggedInUser(request),
  ]);

  if (!user) {
    throw new Response(null, { status: 404 });
  }

  const [album, project, favorites, allCollections] = await Promise.all([
    getUserAlbum(user, albumID),
    getUserProject(user, projectID),
    currentUser ? getFavorites(currentUser.id) : [],
    currentUser ? getCollections(currentUser) : [],
  ]);

  if (
    !album ||
    !project ||
    !album.projects.map(({ id }) => id).includes(project.id)
  ) {
    throw new Response(null, { status: 404 });
  }

  const isCurrentUser = currentUser?.id === album.userId;

  const session = await getAlbumAuthSession(request.headers.get('Cookie'));

  if (!isCurrentUser && album.isSecure && !album.security) {
    throw new Response(null, { status: 404 });
  }

  if (
    !isCurrentUser &&
    album.isSecure &&
    album.security &&
    session.get(album.id) !== album.security.passwordVersion
  ) {
    return redirect(
      `/${getAlbumPath(album, album.user)}/authorize?project=${projectID}`
    );
  }

  const [favouritesCount, categories, following] = await Promise.all([
    countFavourites(project.id),
    getCategories(),
    currentUser && !isCurrentUser
      ? isFollowing({ userId: project.user.id, followerId: currentUser.id })
      : false,
  ]);

  return json<LoaderData>({
    project,
    favorite: findFavorite({ projectId: project.id, favorites }),
    isCurrentUser,
    currentUser,
    favouritesCount,
    album,
    categories,
    following,
    allCollections,
  });
};

export default function AlbumScreen() {
  const {
    project,
    isCurrentUser,
    currentUser,
    favouritesCount,
    favorite,
    album,
    categories,
    following,
    allCollections,
  } = useLoaderData<LoaderData>();

  return (
    <ProjectScreen
      project={project}
      isCurrentUser={isCurrentUser}
      favorite={favorite}
      currentUser={currentUser}
      favouritesCount={favouritesCount}
      categories={categories}
      isFollowing={following}
      allCollections={allCollections}
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
              label: project.user.profile?.nickname ?? null,
              link: `/${getUserPath(project.user)}`,
            },
            {
              icon: <FolderCopyOutlined sx={{ mr: 0.5 }} fontSize="small" />,
              label: album.name,
              link: `/${getAlbumPath(album, project.user)}`,
            },
            {
              icon: <FolderOutlined sx={{ mr: 0.5 }} fontSize="small" />,
              label: project.name,
            },
          ]}
        />
      }
    />
  );
}
