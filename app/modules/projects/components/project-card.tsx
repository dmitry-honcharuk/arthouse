import { GppGoodOutlined } from '@mui/icons-material';
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Stack,
  styled,
  Typography,
} from '@mui/material';
import type { Project } from '@prisma/client';
import { ProjectStatus } from '@prisma/client';
import { Link } from '@remix-run/react';
import type { FC } from 'react';
import { getStatusLabel } from '~/modules/projects/utils/get-status-label';
import type { WithUser } from '~/modules/users/types/with-user';

export const ProjectCard: FC<{
  project: Project & Partial<WithUser>;
  isCurrentUser?: boolean;
  link?: string;
}> = ({
  link,
  isCurrentUser = false,
  project: { id, status, preview, caption, name, user, isSecure },
}) => {
  const cardContent = (
    <>
      {isCurrentUser && (
        <div className="flex justify-end absolute right-0 top-2">
          <Status
            status={status}
            className="text-center capitalize font-bold text-sm py-1 px-2 rounded-l-sm"
          >
            <Typography
              sx={{ fontSize: 14 }}
              color={
                status === ProjectStatus.PUBLISHED
                  ? 'primary.contrastText'
                  : 'text.secondary'
              }
            >
              <Stack direction="row" alignItems="center" gap={1}>
                {getStatusLabel(status)}
                {isSecure && (
                  <GppGoodOutlined fontSize="small" color="inherit" />
                )}
              </Stack>
            </Typography>
          </Status>
        </div>
      )}
      {preview && (
        <CardMedia
          component="img"
          sx={{ height: 200 }}
          image={preview}
          alt="Paella dish"
        />
      )}
      <CardContent>
        {user && (
          <Typography
            variant="subtitle1"
            color="text.secondary"
            component="div"
          >
            {user.profile?.nickname ?? user.email}
          </Typography>
        )}
        <Typography gutterBottom variant="h5" component="div">
          {name}
        </Typography>
        {caption && (
          <Typography variant="body2" color="text.secondary">
            {caption}
          </Typography>
        )}
      </CardContent>
    </>
  );

  const content = link ? (
    <Link to={link} className="block h-full">
      <CardActionArea
        sx={{ alignItems: 'normal' }}
        className="h-full flex-col relative"
      >
        {cardContent}
      </CardActionArea>
    </Link>
  ) : (
    cardContent
  );

  return (
    <Card elevation={3} key={id}>
      {content}
    </Card>
  );
};

const Status = styled('div')<{ status: ProjectStatus }>(
  ({ theme, status }) => ({
    backgroundColor:
      status === ProjectStatus.PUBLISHED
        ? theme.palette.primary.light
        : theme.palette.grey[300],
  })
);
