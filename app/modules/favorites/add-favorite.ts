import { prisma } from '~/db.server';

export async function addFavorite(userId: string, projectId: string) {
  return prisma.project.update({
    where: { id: projectId },
    data: {
      favorites: { create: { userId } },
      favoriteCount: { increment: 1 },
    },
  });
}
