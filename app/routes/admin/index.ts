import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { z } from 'zod';
import { getAdminByEmail } from '~/modules/users/admins/get-admin-by-email';
import { ActionBuilder } from '~/server/action-builder.server';

export const loader: LoaderFunction = async (details) => {
  return new ActionBuilder(details)
    .cors()
    .use('GET', async ({ request }) => {
      const email = z
        .string()
        .parse(new URL(request.url).searchParams.get('email'));

      const admin = await getAdminByEmail(email);

      if (!admin) {
        return json({ message: 'You are not an admin 😡' }, { status: 401 });
      }

      if (admin.user.password) {
        return json({});
      }

      return json({ noPassword: true });
    })
    .build();
};
