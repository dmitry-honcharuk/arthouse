import {
  Add,
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
import { ProjectItemType } from '@prisma/client';
import { Link } from '@remix-run/react';
import format from 'date-fns/format';
import type { FC, ReactNode } from 'react';
import * as React from 'react';
import { useState } from 'react';
import { GravatarAvatar } from '~/modules/common/gravatar-avatar';
import { useToggle } from '~/modules/common/hooks/use-toggle';
import PageLayout from '~/modules/common/page-layout';
import { FavoriteBtn } from '~/modules/favorites/components/favorite-button';
import { HappyMessage } from '~/modules/favorites/components/happy-message';
import { UnhappyMessage } from '~/modules/favorites/components/unhappy-message';
import { ItemForm } from '~/modules/projects/components/item-form';
import { ProjectItems } from '~/modules/projects/components/project-items';
import { ProjectPreviewForm } from '~/modules/projects/components/project-preview-form';
import { ProjectPublicityForm } from '~/modules/projects/components/project-publicity-form';
import { ProjectStatusLabel } from '~/modules/projects/components/project-status-label';
import { TagsCard } from '~/modules/projects/components/tags-card';
import { getProjectPath } from '~/modules/projects/get-project-path';
import type { ProjectWithItems } from '~/modules/projects/types/project-with-items';
import type { WithProjectSecurity } from '~/modules/projects/types/with-project-security';
import { getStatusLabel } from '~/modules/projects/utils/get-status-label';
import type { WithTags } from '~/modules/tags/types/with-tags';
import { NicknameTag } from '~/modules/users/components/profile/nickname-tag';
import { SocialLink } from '~/modules/users/components/profile/social-link';
import { getUserPath } from '~/modules/users/get-user-path';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import type { WithUser } from '~/modules/users/types/with-user';

interface Props {
  isCurrentUser: boolean;
  isFavorite: boolean;
  favouritesCount: number;
  currentUser: UserWithProfile | null;
  project: ProjectWithItems & WithUser & WithProjectSecurity & WithTags;
  breadcrumbs?: ReactNode;
}

export const ProjectScreen: FC<Props> = ({
  project,
  currentUser,
  favouritesCount,
  isCurrentUser,
  isFavorite,
  breadcrumbs,
}) => {
  const [type, setType] = useState<ProjectItemType>(ProjectItemType.IMAGE);
  const [addItem, toggleAddItem] = useToggle(false);

  const settingsPath = `/${getProjectPath(project, project.user)}/settings`;

  return (
    <PageLayout breadcrumbs={breadcrumbs}>
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
              {project.caption && (
                <span className="whitespace-pre-wrap">{project.caption}</span>
              )}
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
                    <ItemForm
                      type={type}
                      onSuccess={() => toggleAddItem()}
                      project={project}
                    />
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
          <ProjectItems project={project} isCurrentUser={isCurrentUser} />
        </Box>
        <Box gridArea="aside" component="aside" className="flex flex-col gap-3">
          {isCurrentUser && (
            <Link
              to={`/${getProjectPath(project, project.user)}/settings`}
              className="flex justify-center"
            >
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
                <ProjectPublicityForm
                  project={project}
                  action={settingsPath}
                  settingsPath={settingsPath}
                />
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
          {(isCurrentUser || !!project.tags.length) && (
            <Card elevation={3}>
              <CardContent>
                <TagsCard
                  project={project}
                  action={settingsPath}
                  isCurrentUser={isCurrentUser}
                />
              </CardContent>
            </Card>
          )}
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
    </PageLayout>
  );
};

const Layout = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),

  gridTemplateAreas: '"aside" "main"',

  [theme.breakpoints.up('md')]: {
    gridTemplateAreas: '"main aside"',
    gridTemplateColumns: '1fr 25%',
  },
}));
