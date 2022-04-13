import { redirect } from '@remix-run/node';
import { verifyUserToken } from '~/modules/auth/jwt';
import { destroySession, getSession } from '~/sessions.server';

export async function requireUser(request: Request) {
  const session = await getSession(request.headers.get('Cookie'));

  const user = verifyUserToken(session.get('user-token'));

  if (!user) {
    throw redirect('/authenticate', {
      headers: {
        'Set-Cookie': await destroySession(session),
      },
    });
  }

  return user;
}
