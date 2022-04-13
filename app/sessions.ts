import { createCookieSessionStorage } from '@remix-run/node';

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: 'arthouse-user-session',
      maxAge: 604_800, // one week
    },
  });
