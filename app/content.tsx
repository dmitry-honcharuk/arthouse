import { pink, teal } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import type { FC } from 'react';
import * as React from 'react';

const theme = createTheme({
  palette: {
    primary: teal,
    secondary: pink,
  },
});

export const Content: FC = ({ children }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
