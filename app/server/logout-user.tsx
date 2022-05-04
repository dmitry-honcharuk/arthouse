import type { Session } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { destroySession } from '~/server/sessions.server';

export async function logoutUser(session: Session) {
  throw redirect('/authenticate', {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
}
