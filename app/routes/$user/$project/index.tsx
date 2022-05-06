import {
  Add,
  ArrowBackIosNew,
  ImageOutlined,
  VideocamOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Typography,
} from '@mui/material';
import { ProjectItemType, ProjectStatus } from '@prisma/client';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useFetcher, useLoaderData } from '@remix-run/react';
import * as React from 'react';
import { useState } from 'react';
import { z } from 'zod';
import { GravatarAvatar } from '~/modules/common/gravatar-avatar';
import { useToggle } from '~/modules/common/hooks/use-toggle';
import { FavoriteBtn } from '~/modules/favorites/components/favorite-button';
import { getFavorites } from '~/modules/favorites/get-favorites';
import { isFavorite } from '~/modules/favorites/helpers/is-favorite';
import { ItemForm } from '~/modules/projects/components/item-form';
import { ProjectItems } from '~/modules/projects/components/project-items';
import { ProjectPreviewForm } from '~/modules/projects/components/project-preview-form';
import { ProjectStatusLabel } from '~/modules/projects/components/project-status-label';
import { createProjectItem } from '~/modules/projects/create-project-item';
import { getUserProject } from '~/modules/projects/get-user-project';
import type { ProjectWithItems } from '~/modules/projects/types/project-with-items';
import { updateProject } from '~/modules/projects/update-project';
import { validateCreateItemFormData } from '~/modules/projects/utils/validate-create-item-form-data';
import { NicknameTag } from '~/modules/users/components/profile/nickname-tag';
import { SocialLink } from '~/modules/users/components/profile/social-link';
import { getUserPath } from '~/modules/users/get-user-path';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import type { WithUser } from '~/modules/users/types/with-user';
import { validateFormData } from '~/modules/validation/validate-form-data';
import { getRequestFormData } from '~/server/get-form-data.server';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';

interface LoaderData {
  isCurrentUser: boolean;
  isFavorite: boolean;
  project: ProjectWithItems & WithUser;
  currentUser: UserWithProfile | null;
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

  return json<LoaderData>({
    project,
    isFavorite: isFavorite({ projectId: project.id, favorites }),
    isCurrentUser,
    currentUser,
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  const { user, project: projectID } = z
    .object({
      user: z.string(),
      project: z.string(),
    })
    .parse(params);

  const project = await getUserProject(user, projectID);

  if (!project) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const formData = await getRequestFormData(request);

  if (request.method === 'PUT') {
    const { status, preview } = validateFormData(
      formData,
      z.object({
        preview: z.string().optional(),
        status: z.nativeEnum(ProjectStatus).optional(),
      })
    );

    return json(
      await updateProject(project.id, {
        status,
        preview,
      })
    );
  }

  const data = validateCreateItemFormData(formData);

  return json(
    await createProjectItem(project.id, {
      type: data.type,
      value: data.type === ProjectItemType.IMAGE ? data.image : data.url,
      title: data.title ?? null,
      caption: data.caption ?? null,
    })
  );
};

export default function ProjectScreen() {
  const { project, isCurrentUser, isFavorite, currentUser } =
    useLoaderData<LoaderData>();

  const [type, setType] = useState<ProjectItemType>(ProjectItemType.IMAGE);
  const [addItem, toggleAddItem] = useToggle(false);
  const statusFetcher = useFetcher();

  const isPublished = project.status === ProjectStatus.PUBLISHED;

  return (
    <>
      <div className="pt-4">
        <Link to={`/${getUserPath(project.user)}`}>
          <Button startIcon={<ArrowBackIosNew />} color="inherit">
            Projects
          </Button>
        </Link>
      </div>
      <Box
        display="grid"
        gridTemplateColumns="1fr 25%"
        gap={2}
        alignItems="start"
      >
        <div className="flex flex-col gap-10">
          {isCurrentUser && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="flex items-start gap-2">
                  <Typography variant="h3">{project.name}</Typography>
                  <ProjectStatusLabel
                    className="text-xs capitalize px-2 py-1 rounded border"
                    status={project.status}
                  >
                    {project.status.toLowerCase()}
                  </ProjectStatusLabel>
                </div>
                <statusFetcher.Form
                  method="put"
                  className="flex flex-col items-start"
                >
                  <input
                    type="hidden"
                    name="status"
                    value={
                      isPublished
                        ? ProjectStatus.DRAFT
                        : ProjectStatus.PUBLISHED
                    }
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color={isPublished ? 'inherit' : 'secondary'}
                  >
                    {isPublished ? 'Unpublish' : 'Publish'}
                  </Button>
                </statusFetcher.Form>
              </div>
              {project.caption && (
                <>
                  <Typography>{project.caption}</Typography>
                </>
              )}
              <ProjectPreviewForm project={project} />
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
        </div>
        <div className="flex flex-col gap-3">
          {!isCurrentUser && currentUser && (
            <FavoriteBtn projectId={project.id} isFavorite={isFavorite} />
          )}
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h4" component="div">
                {project.name}
              </Typography>
              {project.caption && (
                <Typography variant="body2">{project.caption}</Typography>
              )}
              <div className="text-right">
                <Typography variant="overline">
                  {new Date(project.createdAt).toLocaleDateString()}
                </Typography>
              </div>
            </CardContent>
          </Card>
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
        </div>
      </Box>
    </>
  );
}
