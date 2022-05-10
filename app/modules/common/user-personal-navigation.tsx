import {
  BadgeOutlined,
  FavoriteBorderOutlined,
  FolderCopyOutlined,
} from '@mui/icons-material';
import { Tab, Tabs } from '@mui/material';
import { Link, useMatches } from '@remix-run/react';
import type { FC } from 'react';
import * as React from 'react';
import { useState } from 'react';
import { getUserPath } from '~/modules/users/get-user-path';
import { useUserOutletContext } from '~/modules/users/hooks/use-user-outlet-context';

enum Nav {
  Projects = 'projects',
  Favourites = 'favorites',
  Profile = 'profile',
}

export const UserPersonalNavigation: FC = () => {
  const { user, isCurrentUser } = useUserOutletContext();
  const matches = useMatches();
  const current = matches[matches.length - 1];

  const [tab, setTab] = useState(getInitialNav(current.pathname));

  const userPath = getUserPath(user);

  return (
    <Tabs
      value={tab}
      onChange={(_, newValue) => setTab(newValue)}
      aria-label="icon position tabs example"
      orientation="vertical"
    >
      <Tab
        icon={<FolderCopyOutlined />}
        to={`/${userPath}`}
        component={Link}
        value={Nav.Projects}
        iconPosition="end"
        label="projects"
        sx={{
          '&.MuiButtonBase-root': {
            justifyContent: 'flex-end',
          },
        }}
      />
      {isCurrentUser && (
        <Tab
          icon={<FavoriteBorderOutlined />}
          to={`/${userPath}/favorites`}
          value={Nav.Favourites}
          component={Link}
          iconPosition="end"
          label="favorites"
          sx={{
            '&.MuiButtonBase-root': {
              justifyContent: 'flex-end',
            },
          }}
        />
      )}
      <Tab
        icon={<BadgeOutlined />}
        to={`/${userPath}/profile`}
        value={Nav.Profile}
        component={Link}
        iconPosition="end"
        label="profile"
        sx={{
          '&.MuiButtonBase-root': {
            justifyContent: 'flex-end',
          },
        }}
      />
    </Tabs>
  );
};

function getInitialNav(pathname: string): Nav {
  const nav = Object.values(Nav).find((nav) => pathname.includes(nav));

  return nav ?? Nav.Projects;
}
