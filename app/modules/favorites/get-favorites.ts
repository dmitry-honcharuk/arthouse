import { ProjectStatus } from '@prisma/client';
import { prisma } from '~/db.server';
import { getUserByIdentifier } from '~/modules/users/getUserById';

export async function getFavorites(userIdentifier: string) {
  const user = await getUserByIdentifier(userIdentifier);

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
      project: {
        include: {
          projectSecurity: true,
          user: { include: { profile: true } },
        },
      },
    },
  });
}
