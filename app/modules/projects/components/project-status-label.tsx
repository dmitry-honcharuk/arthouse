import { styled } from '@mui/material';
import { ProjectStatus } from '@prisma/client';

export const ProjectStatusLabel = styled('span')<{ status: ProjectStatus }>(
  ({ theme, status }) => ({
    color:
      status === ProjectStatus.PUBLISHED
        ? theme.palette.secondary.light
        : theme.palette.grey[500],
    borderColor:
      status === ProjectStatus.PUBLISHED
        ? theme.palette.secondary.light
        : theme.palette.grey[500],
  })
);
