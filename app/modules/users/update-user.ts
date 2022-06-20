import type { User } from '@prisma/client';
import { prisma } from '~/db.server';

export function updateUser(
  userId: string,
  details: Partial<Pick<User, 'showExplicit'>>
) {
  return prisma.user.update({
    where: { id: userId },
    data: details,
  });
}
