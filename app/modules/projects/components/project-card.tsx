import { Favorite, GppGoodOutlined } from '@mui/icons-material';
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
import { getFullName } from '~/modules/users/utils/get-full-name';

export const ProjectCard: FC<{
  project: Project & Partial<WithUser>;
  showStatus?: boolean;
  showIsSecured?: boolean;
  showFavourite?: boolean;
  link?: string;
}> = ({
  link,
  showIsSecured = false,
  showStatus = false,
  showFavourite = false,
  project: { id, status, preview, caption, name, user, isSecure },
}) => {
  const cardContent = (
    <Stack height="100%">
      {(showStatus || (isSecure && showIsSecured)) && (
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
              <Stack
                component="span"
                direction="row"
                alignItems="center"
                gap={1}
              >
                {showStatus && getStatusLabel(status)}
                {showIsSecured && isSecure && (
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
      <CardContent
        sx={{ '&:last-child': { padding: 2 } }}
        className="flex flex-col grow"
      >
        <div className="grow">
          <Typography gutterBottom variant="h5" component="div">
            {name}
          </Typography>
          {caption && (
            <Typography variant="body2" color="text.secondary">
              {caption}
            </Typography>
          )}
        </div>

        {user?.profile && (
          <Typography
            sx={{
              textAlign: 'right',
              color: ({ palette }) => palette.text.disabled,
            }}
            variant="body2"
          >
            {getFullName(user.profile)}
          </Typography>
        )}
      </CardContent>
      {showFavourite && (
        <>
          <div className="flex justify-end absolute left-2 top-2">
            <Favorite sx={{ color: 'white', fontSize: '1.7rem' }} />
          </div>
          <div className="flex justify-end absolute left-[0.72rem] top-[0.7rem]">
            <Favorite fontSize="small" color="secondary" />
          </div>
        </>
      )}
    </Stack>
  );

  const content = link ? (
    <Link to={link} className="block h-full">
      <CardActionArea sx={{ alignItems: 'normal' }} className="h-full relative">
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
