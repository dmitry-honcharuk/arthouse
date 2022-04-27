import { prisma } from '~/db.server';

export async function deleteFavorite(userId: string, projectId: string) {
  return prisma.favorite.delete({
    where: {
      projectId_userId: {
        userId,
        projectId,
      },
    },
  });
}
