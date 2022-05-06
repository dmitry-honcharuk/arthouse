import {
  FavoriteBorderOutlined,
  PersonPin,
  Shop2Outlined,
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
    >
      <Tab
        icon={<Shop2Outlined />}
        to={`/${userPath}`}
        component={Link}
        value={Nav.Projects}
        iconPosition="end"
        label="projects"
      />
      {isCurrentUser && (
        <Tab
          icon={<FavoriteBorderOutlined />}
          to={`/${userPath}/favorites`}
          value={Nav.Favourites}
          component={Link}
          iconPosition="end"
          label="favorites"
        />
      )}
      <Tab
        icon={<PersonPin />}
        to={`/${userPath}/profile`}
        value={Nav.Profile}
        component={Link}
        iconPosition="end"
        label="profile"
      />
    </Tabs>
  );
};

function getInitialNav(pathname: string): Nav {
  const nav = Object.values(Nav).find((nav) => pathname.includes(nav));

  return nav ?? Nav.Projects;
}
