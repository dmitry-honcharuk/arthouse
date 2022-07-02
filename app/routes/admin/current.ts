import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { verifyAdminToken } from '~/modules/auth/jwt/admin-token.server';
import { ActionBuilder } from '~/server/action-builder.server';
import { getSession } from '~/server/sessions.server';

export const loader: LoaderFunction = async (details) => {
  return new ActionBuilder(details)
    .use('GET', async ({ request }) => {
      const session = await getSession(request.headers.get('Cookie'));

      const token = session.get('admin-token');

      if (!token) {
        return json('no token', { status: 401 });
      }

      const payload = verifyAdminToken(token);

      if (!payload) {
        return json('no payload', { status: 401 });
      }

      return json(payload);
    })
    .build();
};
