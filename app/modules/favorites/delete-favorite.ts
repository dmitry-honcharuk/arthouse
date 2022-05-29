import { prisma } from '~/db.server';

export async function deleteFavorite(userId: string, projectId: string) {
  return prisma.project.update({
    where: { id: projectId },
    data: {
      favorites: {
        delete: {
          projectId_userId: {
            userId,
            projectId,
          },
        },
      },
      favoriteCount: { decrement: 1 },
    },
  });
}
