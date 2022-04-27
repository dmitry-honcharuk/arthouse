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
    },
    include: {
      project: {
        include: {
          user: true,
        },
      },
    },
  });
}
