import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  styled,
  Typography,
} from '@mui/material';
import type { Project } from '@prisma/client';
import { ProjectStatus } from '@prisma/client';
import { Link } from '@remix-run/react';
import type { FC } from 'react';

export const ProjectCard: FC<{
  project: Project;
  isCurrentUser?: boolean;
  link: string;
}> = ({
  link,
  isCurrentUser = false,
  project: { id, status, preview, caption, name },
}) => {
  return (
    <Card elevation={3} key={id}>
      <Link to={link} className="block h-full">
        <CardActionArea
          sx={{ alignItems: 'normal' }}
          className="h-full flex-col relative"
        >
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
                  {status.toLowerCase()}
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
            <Typography gutterBottom variant="h5" component="div">
              {name}
            </Typography>
            {caption && (
              <Typography variant="body2" color="text.secondary">
                {caption}
              </Typography>
            )}
          </CardContent>
        </CardActionArea>
      </Link>
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
