import { prisma } from '~/db.server';

export async function addFavorite(userId: string, projectId: string) {
  return prisma.favorite.create({
    data: {
      userId,
      projectId,
    },
  });
}
