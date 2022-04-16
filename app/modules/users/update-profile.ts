import type { Profile } from '@prisma/client';
import { prisma } from '~/db.server';

export function updateProfile(
  userId: string,
  details: Partial<Omit<Profile, 'id'>>
) {
  return prisma.profile.upsert({
    where: { userId },
    create: { userId, ...details },
    update: details,
  });
}
