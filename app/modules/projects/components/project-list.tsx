import { styled } from '@mui/material';

export const Projects = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),

  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },

  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(5, 1fr)',
  },
}));
