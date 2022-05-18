import { prisma } from '~/db.server';

export async function deleteProject(projectId: string) {
  await prisma.project.delete({
    where: { id: projectId },
  });
}
