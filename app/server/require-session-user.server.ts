import type { User } from '@prisma/client';
import { getSessionUser } from '~/server/get-session.user.server';
import { logoutUser } from '~/server/logout-user';
import { getSession } from '~/sessions.server';

export async function requireSessionUser(request: Request) {
  const [session, user] = await Promise.all([
    getSession(request.headers.get('Cookie')),
    getSessionUser(request),
  ]);

  if (!user) {
    await logoutUser(session);
  }

  return user as User;
}
