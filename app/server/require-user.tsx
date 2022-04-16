import type { User } from '@prisma/client';
import { verifyUserToken } from '~/modules/auth/jwt';
import { logoutUser } from '~/server/logout-user';
import { getSession } from '~/sessions.server';

export async function requireUser(request: Request) {
  const session = await getSession(request.headers.get('Cookie'));

  const user = verifyUserToken(session.get('user-token'));

  if (!user) {
    await logoutUser(session);
  }

  return user as User;
}
