import { getLoggedInUser } from '~/server/get-logged-in-user.server';
import { logoutUser } from '~/server/logout-user';
import { getSession } from '~/server/sessions.server';

export async function requireLoggedInUser(request: Request) {
  const [session, user] = await Promise.all([
    getSession(request.headers.get('Cookie')),
    getLoggedInUser(request),
  ]);

  if (!user) {
    // throws redirect
    await logoutUser(session);
  }

  return user!;
}
