import { getUserByIdentifier } from '~/modules/users/getUserById';
import type { UserWithProfile } from '~/modules/users/types/social-user';
import { logoutUser } from '~/server/logout-user';
import { requireUser } from '~/server/require-user';
import { getSession } from '~/sessions.server';

export async function getLoggedInUser(request: Request) {
  const userPayload = await requireUser(request);

  const user = await getUserByIdentifier(userPayload.id);

  if (!user) {
    const session = await getSession(request.headers.get('Cookie'));

    // throws redirect
    await logoutUser(session);
  }

  return user as UserWithProfile;
}
