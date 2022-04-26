import { prisma } from '~/db.server';

export async function deleteProjectItem(itemId: string) {
  await prisma.projectItem.delete({
    where: { id: itemId },
  });
}
