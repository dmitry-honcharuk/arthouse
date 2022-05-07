import {
  Add,
  ArrowBackIosNew,
  Favorite,
  FavoriteBorderOutlined,
  GppGoodOutlined,
  ImageOutlined,
  SettingsOutlined,
  VideocamOutlined,
} from '@mui/icons-material';
import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Stack,
  styled,
  Tooltip,
  Typography,
} from '@mui/material';
import { ProjectItemType, ProjectStatus } from '@prisma/client';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import format from 'date-fns/format';
import * as React from 'react';
import { useState } from 'react';
import { z } from 'zod';
import { GravatarAvatar } from '~/modules/common/gravatar-avatar';
import { useToggle } from '~/modules/common/hooks/use-toggle';
import { FavoriteBtn } from '~/modules/favorites/components/favorite-button';
import { HappyMessage } from '~/modules/favorites/components/happy-message';
import { UnhappyMessage } from '~/modules/favorites/components/unhappy-message';
import { countFavourites } from '~/modules/favorites/count-favourites';
import { getFavorites } from '~/modules/favorites/get-favorites';
import { isFavorite } from '~/modules/favorites/helpers/is-favorite';
import { ItemForm } from '~/modules/projects/components/item-form';
import { ProjectItems } from '~/modules/projects/components/project-items';
import { ProjectPreviewForm } from '~/modules/projects/components/project-preview-form';
import { ProjectPublicityForm } from '~/modules/projects/components/project-publicity-form';
import { ProjectStatusLabel } from '~/modules/projects/components/project-status-label';
import { createProjectItem } from '~/modules/projects/create-project-item';
import { getProjectPath } from '~/modules/projects/get-project-path';
import { getUserProject } from '~/modules/projects/get-user-project';
import type { ProjectWithItems } from '~/modules/projects/types/project-with-items';
import type { WithProjectSecurity } from '~/modules/projects/types/with-project-security';
import { getStatusLabel } from '~/modules/projects/utils/get-status-label';
import { validateCreateItemFormData } from '~/modules/projects/utils/validate-create-item-form-data';
import { NicknameTag } from '~/modules/users/components/profile/nickname-tag';
import { SocialLink } from '~/modules/users/components/profile/social-link';
import { getUserPath } from '~/modules/users/get-user-path';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import type { WithUser } from '~/modules/users/types/with-user';
import { ActionBuilder } from '~/server/action-builder.server';
import { FormDataHandler } from '~/server/form-data-handler.server';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';
import { getProjectAuthSession } from '~/server/project-auth-sessions.server';

interface LoaderData {
  isCurrentUser: boolean;
  isFavorite: boolean;
  favouritesCount: number;
  currentUser: UserWithProfile | null;
  project: ProjectWithItems & WithUser & WithProjectSecurity;
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

  if (
    !isCurrentUser &&
    project.isSecure &&
    project.projectSecurity &&
    session.get(project.id) !== project.projectSecurity.passwordVersion
  ) {
    return redirect(`/${getProjectPath(project, project.user)}/authorize`);
  }

  return json<LoaderData>({
    project,
    isFavorite: isFavorite({ projectId: project.id, favorites }),
    isCurrentUser,
    currentUser,
    favouritesCount: await countFavourites(project.id),
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
      const data = validateCreateItemFormData(
        await formDataHandler.getFormData()
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

export default function ProjectScreen() {
  const { project, isCurrentUser, isFavorite, currentUser, favouritesCount } =
    useLoaderData<LoaderData>();

  const [type, setType] = useState<ProjectItemType>(ProjectItemType.IMAGE);
  const [addItem, toggleAddItem] = useToggle(false);

  const settingsPath = `/${getProjectPath(project, project.user)}/settings`;

  return (
    <>
      <div className="pt-4">
        <Link to={`/${getUserPath(project.user)}`}>
          <Button startIcon={<ArrowBackIosNew />} color="inherit">
            {isCurrentUser ? 'Your Projects' : 'User Projects'}
          </Button>
        </Link>
      </div>
      <Layout>
        <Box gridArea="main" component="main" className="flex flex-col gap-10">
          {isCurrentUser && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="flex items-start gap-2">
                  <Typography variant="h3">{project.name}</Typography>
                  <ProjectStatusLabel
                    className="text-sm capitalize px-2 py-1 rounded border"
                    status={project.status}
                  >
                    <Stack direction="row" alignItems="center" gap={1}>
                      {getStatusLabel(project.status)}
                      {project.isSecure && <GppGoodOutlined fontSize="small" />}
                    </Stack>
                  </ProjectStatusLabel>
                </div>
              </div>
              {project.caption && <Typography>{project.caption}</Typography>}
              <ProjectPreviewForm project={project} action={settingsPath} />
            </div>
          )}
          {isCurrentUser ? (
            addItem ? (
              <div className="flex flex-col gap-2">
                <Typography variant="h4">New slide</Typography>

                <div className="flex gap-4 items-start">
                  <Paper elevation={3}>
                    <MenuList>
                      <MenuItem
                        selected={type === ProjectItemType.IMAGE}
                        onClick={() => setType(ProjectItemType.IMAGE)}
                        sx={{ pr: 3 }}
                      >
                        <ListItemIcon>
                          <ImageOutlined />
                        </ListItemIcon>
                        <ListItemText>Image Upload</ListItemText>
                      </MenuItem>
                      <MenuItem
                        selected={type === ProjectItemType.YOUTUBE}
                        onClick={() => setType(ProjectItemType.YOUTUBE)}
                        sx={{ pr: 3 }}
                      >
                        <ListItemIcon>
                          <VideocamOutlined />
                        </ListItemIcon>
                        <ListItemText>Video Link</ListItemText>
                      </MenuItem>
                    </MenuList>
                  </Paper>
                  <Paper className="flex justify-center grow p-3" elevation={3}>
                    <ItemForm type={type} onSuccess={() => toggleAddItem()} />
                  </Paper>
                </div>
              </div>
            ) : (
              <div>
                <Button
                  onClick={() => toggleAddItem()}
                  variant="outlined"
                  startIcon={<Add />}
                >
                  Add slide
                </Button>
              </div>
            )
          ) : null}
          <ProjectItems items={project.items} isCurrentUser={isCurrentUser} />
        </Box>
        <Box gridArea="aside" component="aside" className="flex flex-col gap-3">
          {isCurrentUser && (
            <Link to="settings" className="flex justify-center">
              <Button
                type="submit"
                startIcon={<SettingsOutlined />}
                variant="outlined"
              >
                Project Settings
              </Button>
            </Link>
          )}
          {!isCurrentUser && currentUser && (
            <FavoriteBtn projectId={project.id} isFavorite={isFavorite} />
          )}
          {isCurrentUser && (
            <Card variant="outlined">
              <CardContent>
                <Tooltip
                  title={
                    favouritesCount ? (
                      <HappyMessage count={favouritesCount} />
                    ) : (
                      <UnhappyMessage />
                    )
                  }
                >
                  <Badge badgeContent={favouritesCount} color="primary">
                    {favouritesCount ? (
                      <Favorite color="secondary" />
                    ) : (
                      <FavoriteBorderOutlined color="secondary" />
                    )}
                  </Badge>
                </Tooltip>
              </CardContent>
            </Card>
          )}
          <Card elevation={3}>
            {project.isSecure && (
              <CardMedia className="text-center bg-slate-100 py-1">
                <GppGoodOutlined />
              </CardMedia>
            )}
            <CardContent>
              <Typography variant="h4" component="div">
                {project.name}
              </Typography>
              {project.caption && (
                <Typography variant="body2">{project.caption}</Typography>
              )}
              <div className="text-right">
                <Typography variant="overline">
                  {format(new Date(project.createdAt), 'MMM do, yyyy')}
                </Typography>
              </div>
            </CardContent>
          </Card>
          {isCurrentUser && (
            <Card elevation={3}>
              <CardContent>
                <ProjectPublicityForm project={project} action={settingsPath} />
              </CardContent>
            </Card>
          )}
          <Card elevation={3}>
            <CardContent>
              <div className="flex flex-col mb-2">
                <div className="flex flex-row gap-4 items-center">
                  <Link to={`/${getUserPath(project.user)}`}>
                    <GravatarAvatar email={project.user.email} />
                  </Link>
                  {project.user.profile?.nickname && (
                    <NicknameTag
                      nickname={project.user.profile.nickname}
                      isLink
                    />
                  )}
                </div>
              </div>
              {project.user.profile?.summary && (
                <p className="text-sm">{project.user.profile.summary}</p>
              )}
            </CardContent>
          </Card>
          {!!project.user.profile?.socialLinks.length && (
            <Card elevation={3}>
              <CardContent>
                <div className="flex flex-col gap-2">
                  {project.user.profile.socialLinks.map((link, index) => {
                    return (
                      <SocialLink key={`${link}-${index}`} link={link}>
                        {({ icon, label, href }) => (
                          <div className="flex items-center gap-3">
                            <div>{icon}</div>
                            <div>
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <span className="underline">{label}</span>
                              </a>
                            </div>
                          </div>
                        )}
                      </SocialLink>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </Box>
      </Layout>
    </>
  );
}

export const Layout = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),

  gridTemplateAreas: '"aside" "main"',

  [theme.breakpoints.up('md')]: {
    gridTemplateAreas: '"main aside"',
    gridTemplateColumns: '1fr 25%',
  },
}));
