import { validate } from 'uuid';
import { prisma } from '~/db.server';
import { getUserByIdentifier } from '../users/getUserById';

export async function getUserProject(
  userIdentifier: string,
  projectIdentifier: string
) {
  const isUUID = validate(projectIdentifier);

  const user = await getUserByIdentifier(userIdentifier);

  if (!user) {
    throw new Error(`Invalid user identifier ${userIdentifier}`);
  }

  return prisma.project.findFirst({
    where: {
      userId: user.id,
      ...(isUUID ? { id: projectIdentifier } : { slug: projectIdentifier }),
    },
    include: {
      items: true,
    },
  });
}
