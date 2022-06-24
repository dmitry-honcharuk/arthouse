import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { z } from 'zod';
import { getAdminToken } from '~/modules/auth/jwt/admin-token.server';
import { checkPassword, hashPassword } from '~/modules/crypto/password';
import { getAdminByEmail } from '~/modules/users/admins/get-admin-by-email';
import { updateUser } from '~/modules/users/update-user';
import { ActionBuilder } from '~/server/action-builder.server';
import { FormDataHandler } from '~/server/form-data-handler.server';
import { getSession } from '~/server/sessions.server';

export const action: ActionFunction = async (a) => {
  return new ActionBuilder(a)
    .cors()
    .use('POST', async ({ request }) => {
      const session = await getSession(request.headers.get('Cookie'));
      const formDataHandler = new FormDataHandler(request);

      const { email } = await formDataHandler.validate(
        z.object({
          email: z.string().email(),
        })
      );

      const admin = await getAdminByEmail(email);

      if (!admin) {
        return json({ message: 'You are not an admin 😡' }, { status: 401 });
      }

      const { password } = await formDataHandler.validate(
        z.object({
          password: z.string(),
        })
      );

      if (!admin.user.password) {
        const { passwordConfirm } = await formDataHandler.validate(
          z.object({
            passwordConfirm: z.string(),
          })
        );

        if (passwordConfirm !== password) {
          return json('Passwords do not match', { status: 401 });
        }

        const hashedPassword = await hashPassword(password);

        await updateUser(admin.user.id, {
          password: hashedPassword,
        });

        session.set('admin-token', getAdminToken(admin));

        return json(null);
      }

      const valid = await checkPassword(password, admin.user.password);

      if (!valid) {
        return json('Invalid password', { status: 401 });
      }

      session.set('admin-token', getAdminToken(admin));

      return json(null);
    })
    .build();
};
