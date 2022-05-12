import { createCookieSessionStorage } from '@remix-run/node';

export const {
  getSession: getAlbumAuthSession,
  commitSession: commitAlbumAuthSession,
  destroySession: destroyAlbumAuthSession,
} = createCookieSessionStorage({
  cookie: {
    name: 'arthouse-album-auth-session',
  },
});
