import type { User } from '@prisma/client';
import { ProjectStatus } from '@prisma/client';
import { prisma } from '~/db.server';
import { getUserByIdentifier } from '~/modules/users/getUserById';

export async function getFavorites(userIdentifier: string | Pick<User, 'id'>) {
  const user =
    typeof userIdentifier === 'string'
      ? await getUserByIdentifier(userIdentifier)
      : userIdentifier;

  if (!user) {
    throw new Error(`Invalid user identifier ${userIdentifier}`);
  }

  return prisma.favorite.findMany({
    where: {
      userId: user.id,
      project: {
        status: ProjectStatus.PUBLISHED,
        isSecure: false,
      },
    },
    include: {
      collections: true,
      project: {
        include: {
          security: true,
          user: { include: { profile: true } },
        },
      },
    },
  });
}
