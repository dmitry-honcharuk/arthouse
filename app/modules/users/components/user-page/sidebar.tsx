import { Face, Shop2 } from '@mui/icons-material';
import {
  Divider,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
} from '@mui/material';
import { NavLink } from '@remix-run/react';
import type { FC } from 'react';
import * as React from 'react';

export const SIDEBAR_WIDTH = 250;

export const UserPageSidebar: FC = () => {
  return (
    <Paper sx={{ width: SIDEBAR_WIDTH, maxWidth: '100%' }} elevation={6}>
      <MenuList>
        <NavLink to={`projects`}>
          {({ isActive }) => (
            <MenuItem selected={isActive}>
              <ListItemIcon>
                <Shop2 />
              </ListItemIcon>
              <ListItemText>
                <span className="text-lg">Projects</span>
              </ListItemText>
            </MenuItem>
          )}
        </NavLink>
        <Divider />
        <NavLink to={`profile`}>
          {({ isActive }) => (
            <MenuItem selected={isActive}>
              <ListItemIcon>
                <Face />
              </ListItemIcon>
              <ListItemText>
                <span className="text-lg">Profile</span>
              </ListItemText>
            </MenuItem>
          )}
        </NavLink>
      </MenuList>
    </Paper>
  );
};
