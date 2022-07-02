import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { ActionBuilder } from '~/server/action-builder.server';
import { commitSession, getSession } from '~/server/sessions.server';

export const action: ActionFunction = async (a) => {
  return new ActionBuilder(a)
    .use('POST', async ({ request }) => {
      const session = await getSession(request.headers.get('Cookie'));

      session.unset('admin-token');

      return json(null, {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      });
    })
    .build();
};
