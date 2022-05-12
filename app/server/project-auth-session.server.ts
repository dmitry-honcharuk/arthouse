import { createCookieSessionStorage } from '@remix-run/node';

export const {
  getSession: getProjectAuthSession,
  commitSession: commitProjectAuthSession,
  destroySession: destroyProjectAuthSession,
} = createCookieSessionStorage({
  cookie: {
    name: 'arthouse-project-auth-session',
  },
});
