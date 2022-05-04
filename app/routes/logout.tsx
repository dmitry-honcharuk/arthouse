import type { ActionFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { destroySession, getSession } from '~/server/sessions.server';

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'));

  return redirect('/authenticate', {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
};
