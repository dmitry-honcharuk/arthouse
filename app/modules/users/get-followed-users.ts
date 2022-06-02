import { prisma } from '~/db.server';
import type { UserWithProfile } from './types/user-with-profile';

export async function getFollowedUsers(
  followerId: string
): Promise<UserWithProfile[]> {
  const user = await prisma.user.findUnique({
    where: {
      id: followerId,
    },
    include: {
      following: {
        include: { profile: true },
      },
    },
  });

  return user?.following ?? [];
}
