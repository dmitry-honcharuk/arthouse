import { Logout, Person } from '@mui/icons-material';
import {
  Avatar,
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  styled,
  Typography,
} from '@mui/material';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import { Link, useFetcher, useNavigate } from '@remix-run/react';
import md5 from 'md5';
import type { FC } from 'react';
import * as React from 'react';
import { useMemo, useRef, useState } from 'react';
import { NicknameTag } from '../users/components/profile/nickname-tag';
import { getUserPath } from '../users/get-user-path';
import type { UserWithProfile } from '../users/types/user-with-profile';

const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

export const Header: FC<{ user: UserWithProfile | null }> = ({ user }) => {
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const logoutRef = useRef<HTMLFormElement>(null);
  const emailHash = useMemo(
    () => (user?.email ? md5(user.email) : null),
    [user?.email]
  );

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar className="justify-between">
          <Link to="/">
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
            >
              Arthouse
            </Typography>
          </Link>

          {user ? (
            <>
              <IconButton
                sx={{ p: 0 }}
                onClick={(event) => setAnchorElUser(event.currentTarget)}
              >
                <Avatar
                  alt="picture"
                  src={`https://www.gravatar.com/avatar/${emailHash}`}
                />
              </IconButton>
              <Menu
                sx={{ mt: '45px', textAlign: 'right' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem disabled>
                  {user.profile?.nickname ? (
                    <ListItemText
                      primary={user.email}
                      secondary={
                        <NicknameTag nickname={user.profile.nickname} />
                      }
                    />
                  ) : (
                    <ListItemText primary={user.email} />
                  )}
                </MenuItem>

                <Divider />
                <MenuItem
                  onClick={() => {
                    handleCloseUserMenu();
                    navigate(`/${getUserPath(user)}`);
                  }}
                >
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  <ListItemText className="text-left">Personal</ListItemText>
                </MenuItem>
                <fetcher.Form ref={logoutRef} action="/logout" method="post">
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      fetcher.submit(logoutRef.current);
                    }}
                  >
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    <Typography>Logout</Typography>
                  </MenuItem>
                </fetcher.Form>
              </Menu>
            </>
          ) : (
            <Link to="/authenticate">
              <Button color="inherit">Login</Button>
            </Link>
          )}
        </Toolbar>
      </AppBar>
      <Offset />
    </>
  );
};
