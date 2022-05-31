import { prisma } from '~/db.server';

export async function setCategories(projectId: string, categoryIds: number[]) {
  return prisma.project.update({
    where: { id: projectId },
    data: {
      categories: {
        set: categoryIds.map((id) => ({ id })),
      },
    },
  });
}
