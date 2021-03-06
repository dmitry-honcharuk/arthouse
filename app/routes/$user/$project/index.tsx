import {
  FolderOutlined,
  GridViewOutlined,
  PersonPin,
} from '@mui/icons-material';
import type { Category, Collection, Favorite } from '@prisma/client';
import { ProjectItemType, ProjectStatus } from '@prisma/client';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { z } from 'zod';
import { getCategories } from '~/modules/categories/get-categories';
import type { WithCategories } from '~/modules/categories/types/with-categories';
import { Breadcrumbs } from '~/modules/common/breadcrumbs';
import { countFavourites } from '~/modules/favorites/count-favourites';
import { getCollections } from '~/modules/favorites/get-collections';
import { getFavorites } from '~/modules/favorites/get-favorites';
import { findFavorite } from '~/modules/favorites/helpers/find-favorite';
import type { WithCollections } from '~/modules/favorites/types/with-collections';
import { ProjectScreen } from '~/modules/projects/components/project-screen';
import { createProjectItem } from '~/modules/projects/create-project-item';
import { getProjectPath } from '~/modules/projects/get-project-path';
import { getUserProject } from '~/modules/projects/get-user-project';
import type { ProjectWithItems } from '~/modules/projects/types/project-with-items';
import type { WithProjectSecurity } from '~/modules/projects/types/with-project-security';
import type { WithTags } from '~/modules/tags/types/with-tags';
import { getUserPath } from '~/modules/users/get-user-path';
import { isFollowing } from '~/modules/users/is-following';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import type { WithUser } from '~/modules/users/types/with-user';
import { ActionBuilder } from '~/server/action-builder.server';
import { FormDataHandler } from '~/server/form-data-handler.server';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';
import { getProjectAuthSession } from '~/server/project-auth-session.server';
import { getUserDetailsSession } from '~/server/user-details-session.server';

interface LoaderData {
  isCurrentUser: boolean;
  favorite: null | (Favorite & WithCollections);
  favouritesCount: number;
  currentUser: UserWithProfile | null;
  project: ProjectWithItems &
    WithUser &
    WithProjectSecurity &
    WithTags &
    WithCategories;
  categories: Category[];
  following: boolean;
  allCollections: Collection[];
  isAgeConfirmed: boolean;
}

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

  const favorites = currentUser ? await getFavorites(currentUser.id) : [];

  const isCurrentUser = currentUser?.id === project.userId;

  if (!isCurrentUser && project.status !== ProjectStatus.PUBLISHED) {
    throw new Response('Not Found', { status: 404 });
  }

  const session = await getProjectAuthSession(request.headers.get('Cookie'));

  if (!isCurrentUser && project.isSecure && !project.security) {
    throw new Response(null, { status: 404 });
  }

  if (
    !isCurrentUser &&
    project.isSecure &&
    project.security &&
    session.get(project.id) !== project.security.passwordVersion
  ) {
    return redirect(`/${getProjectPath(project, project.user)}/authorize`);
  }

  const [favouritesCount, categories, following, allCollections, userSession] =
    await Promise.all([
      countFavourites(project.id),
      getCategories(),
      currentUser && !isCurrentUser
        ? isFollowing({ userId: project.user.id, followerId: currentUser.id })
        : false,
      currentUser ? getCollections(currentUser) : [],
      getUserDetailsSession(request.headers.get('Cookie')),
    ]);

  return json<LoaderData>({
    project,
    favorite: findFavorite({ projectId: project.id, favorites }),
    isCurrentUser,
    currentUser,
    favouritesCount,
    categories,
    following,
    allCollections,
    isAgeConfirmed: userSession.get('age-confirmed') === 'true',
  });
};

export const action: ActionFunction = async (context) => {
  const { user, project: projectID } = z
    .object({
      user: z.string(),
      project: z.string(),
    })
    .parse(context.params);

  const project = await getUserProject(user, projectID);

  if (!project) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const formDataHandler = new FormDataHandler(context.request);

  return new ActionBuilder(context)
    .use('POST', async () => {
      const commonFields = {
        title: z.ostring(),
        caption: z.ostring(),
      };

      const data = await formDataHandler.validate(
        z.union([
          z.object({
            ...commonFields,
            type: z.literal(ProjectItemType.IMAGE),
            image: z.string(),
          }),
          z.object({
            ...commonFields,
            type: z.literal(ProjectItemType.YOUTUBE),
            url: z.string(),
          }),
        ])
      );

      return json(
        await createProjectItem(project.id, {
          type: data.type,
          value: data.type === ProjectItemType.IMAGE ? data.image : data.url,
          title: data.title ?? null,
          caption: data.caption ?? null,
        })
      );
    })
    .build();
};

export default function ProjectPage() {
  const {
    project,
    isCurrentUser,
    favorite,
    currentUser,
    favouritesCount,
    categories,
    following,
    allCollections,
    isAgeConfirmed,
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
      isAgeConfirmed={isAgeConfirmed}
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
              icon: <FolderOutlined sx={{ mr: 0.5 }} fontSize="small" />,
              label: project.name,
            },
          ]}
        />
      }
    />
  );
}
