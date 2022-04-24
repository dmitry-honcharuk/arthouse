import { verifyUserToken } from '~/modules/auth/jwt';
import { getSession } from '~/sessions.server';

export async function getSessionUser(request: Request) {
  const session = await getSession(request.headers.get('Cookie'));

  return verifyUserToken(session.get('user-token'));
}
