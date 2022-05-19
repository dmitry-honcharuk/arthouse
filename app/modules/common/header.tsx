import { Logout, Person, SearchOutlined } from '@mui/icons-material';
import {
  alpha,
  Button,
  Divider,
  Hidden,
  InputAdornment,
  InputBase,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  styled,
  Typography,
} from '@mui/material';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import { Form, Link, useFetcher, useNavigate } from '@remix-run/react';
import type { FC } from 'react';
import * as React from 'react';
import { useRef, useState } from 'react';
import { GravatarAvatar } from '~/modules/common/gravatar-avatar';
import { NicknameTag } from '../users/components/profile/nickname-tag';
import { getUserPath } from '../users/get-user-path';
import type { UserWithProfile } from '../users/types/user-with-profile';

const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

export const Header: FC<{ user: UserWithProfile | null }> = ({ user }) => {
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const logoutRef = useRef<HTMLFormElement>(null);

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar className="justify-between">
          <Link to="/">
            <Typography variant="h6" noWrap component="div">
              <Hidden smDown>Arthouse</Hidden>
              <Hidden smUp>AH</Hidden>
            </Typography>
          </Link>

          <Stack direction="row" gap={1} alignItems="center">
            <SearchForm />
            {user ? (
              <>
                <IconButton
                  sx={{ p: 0 }}
                  onClick={(event) => setAnchorElUser(event.currentTarget)}
                >
                  <GravatarAvatar email={user.email} />
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
          </Stack>
        </Toolbar>
      </AppBar>
      <Offset />
    </>
  );
};

const SearchForm = () => {
  const [query, setQuery] = useState('');

  return (
    <Form
      action="/search"
      onSubmit={() => {
        setQuery('');
      }}
    >
      <Search>
        <StyledInputBase
          placeholder="Search…"
          name="q"
          inputProps={{ 'aria-label': 'search' }}
          value={query}
          onChange={({ target }) => setQuery(target.value)}
          endAdornment={
            <InputAdornment position="end">
              <IconButton type="submit" size="small" edge="end">
                <SearchOutlined sx={{ color: 'white' }} />
              </IconButton>
            </InputAdornment>
          }
        />
      </Search>
    </Form>
  );
};

const Search = styled('div')(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  paddingRight: `0.5em`,

  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `1em`,
    transition: theme.transitions.create('width'),
    width: '100%',

    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));
