import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
  commitUserDetailsSession,
  getUserDetailsSession,
} from '~/server/user-details-session.server';

export const action: ActionFunction = async ({ request }) => {
  const session = await getUserDetailsSession(request.headers.get('Cookie'));

  session.set('age-confirmed', 'true');

  return json(null, {
    headers: {
      'Set-Cookie': await commitUserDetailsSession(session),
    },
  });
};
