import type { User } from '@prisma/client';
import { validate } from 'uuid';
import { prisma } from '~/db.server';
import { getUserByIdentifier } from '../users/getUserById';

export async function getUserProject(
  userIdentifier: string | Pick<User, 'id'>,
  projectIdentifier: string
) {
  const isUUID = validate(projectIdentifier);

  const user =
    typeof userIdentifier === 'string'
      ? await getUserByIdentifier(userIdentifier)
      : userIdentifier;

  if (!user) {
    throw new Error(`Invalid user identifier ${userIdentifier}`);
  }

  return prisma.project.findFirst({
    where: {
      userId: user.id,
      ...(isUUID ? { id: projectIdentifier } : { slug: projectIdentifier }),
    },
    include: {
      tags: true,
      security: true,
      user: {
        include: { profile: true },
      },
      items: true,
    },
  });
}
