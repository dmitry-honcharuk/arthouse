import { prisma } from '~/db.server';
import { getUserByIdentifier } from '../users/getUserById';

export async function getUserProjects(userIdentifier: string) {
  const user = await getUserByIdentifier(userIdentifier);

  if (!user) {
    throw new Error(`Invalid user identifier ${userIdentifier}`);
  }

  return prisma.project.findMany({
    where: {
      userId: user.id,
    },
    include: {
      items: true,
    },
  });
}
