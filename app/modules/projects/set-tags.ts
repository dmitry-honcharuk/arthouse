import { prisma } from '~/db.server';

export async function setTags(projectId: string, tagNames: string[]) {
  const tags = await Promise.all(
    tagNames.map((name) =>
      prisma.tag.upsert({
        where: { name },
        create: { name },
        update: { name },
      })
    )
  );

  return prisma.project.update({
    where: { id: projectId },
    data: {
      tags: {
        set: tags.map(({ id }) => ({ id })),
      },
    },
  });
}
