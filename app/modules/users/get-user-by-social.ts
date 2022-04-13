import type { User } from '@prisma/client';
import { prisma } from '~/db.server';

type Details = Pick<User, 'email' | 'googleId'>;

export async function getUserBySocial({
  email,
  googleId,
}: Details): Promise<User> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email, googleId },
        { email, googleId: null },
      ],
    },
  });

  if (!user) {
    return prisma.user.create({ data: { email, googleId } });
  }

  if (!user.googleId) {
    return prisma.user.update({
      where: { id: user.id },
      data: { googleId },
    });
  }

  return user;
}
