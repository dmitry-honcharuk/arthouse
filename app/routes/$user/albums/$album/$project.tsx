import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import * as React from 'react';
import { z } from 'zod';
import { getUserAlbum } from '~/modules/albums/get-user-album';
import { countFavourites } from '~/modules/favorites/count-favourites';
import { getFavorites } from '~/modules/favorites/get-favorites';
import { isFavorite } from '~/modules/favorites/helpers/is-favorite';
import { ProjectScreen } from '~/modules/projects/components/project-screen';
import { getUserProject } from '~/modules/projects/get-user-project';
import type { ProjectWithItems } from '~/modules/projects/types/project-with-items';
import type { WithProjectSecurity } from '~/modules/projects/types/with-project-security';
import { getUserByIdentifier } from '~/modules/users/getUserById';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import type { WithUser } from '~/modules/users/types/with-user';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';

interface LoaderData {
  isCurrentUser: boolean;
  project: ProjectWithItems & WithUser & WithProjectSecurity;
  currentUser: UserWithProfile | null;
  isFavorite: boolean;
  favouritesCount: number;
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

  const user = await getUserByIdentifier(userID);

  if (!user) {
    throw new Response(null, { status: 404 });
  }

  const [currentUser, album, project, favorites] = await Promise.all([
    getLoggedInUser(request),
    getUserAlbum(user, albumID),
    getUserProject(user, projectID),
    getFavorites(user),
  ]);

  if (!album || !project) {
    throw new Response(null, { status: 404 });
  }

  const isCurrentUser = currentUser?.id === album.userId;

  return json<LoaderData>({
    project,
    isFavorite: isFavorite({ projectId: project.id, favorites }),
    isCurrentUser,
    currentUser,
    favouritesCount: await countFavourites(project.id),
  });
};

export default function AlbumScreen() {
  const { project, isCurrentUser, currentUser, favouritesCount, isFavorite } =
    useLoaderData<LoaderData>();

  return (
    <ProjectScreen
      project={project}
      isCurrentUser={isCurrentUser}
      isFavorite={isFavorite}
      currentUser={currentUser}
      favouritesCount={favouritesCount}
    />
  );
}
