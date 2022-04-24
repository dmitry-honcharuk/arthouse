import { getUserByIdentifier } from '~/modules/users/getUserById';
import { getSessionUser } from '~/server/get-session.user.server';

export async function getLoggedInUser(request: Request) {
  const userPayload = await getSessionUser(request);

  if (!userPayload) {
    return null;
  }

  return getUserByIdentifier(userPayload!.id);
}
