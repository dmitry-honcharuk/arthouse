import { createCookieSessionStorage } from '@remix-run/node';

export const {
  getSession: getUserDetailsSession,
  commitSession: commitUserDetailsSession,
  destroySession: destroyUserDetailsSession,
} = createCookieSessionStorage({
  cookie: {
    name: 'arthouse-user-details',
  },
});
