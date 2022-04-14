import { prisma } from '~/db.server';
import { logoutUser } from '~/server/logout-user';
import { requireUser } from '~/server/require-user';
import { getSession } from '~/sessions.server';

export async function getLoggedInUser(request: Request) {
  const userPayload = await requireUser(request);

  const user = await prisma.user.findUnique({
    where: {
      id: userPayload.id,
    },
    include: { profile: true },
  });

  if (!user) {
    const session = await getSession(request.headers.get('Cookie'));
    await logoutUser(session);

    return;
  }

  return user;
}
