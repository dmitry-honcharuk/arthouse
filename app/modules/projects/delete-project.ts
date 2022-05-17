import { prisma } from '~/db.server';

export async function deleteProject(projectId: string) {
  await prisma.projectItem.deleteMany({
    where: { projectId },
  });

  await prisma.project.delete({
    where: { id: projectId },
  });
}
