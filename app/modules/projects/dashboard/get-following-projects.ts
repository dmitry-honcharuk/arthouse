import type { User } from '@prisma/client';
import { ProjectStatus } from '@prisma/client';
import { getProjects } from '~/modules/projects/get-projects';
import type { FullProject } from '~/modules/projects/types/full-project';
import { getFollowedUsers } from '~/modules/users/get-followed-users';

export async function getFollowingProjects({
  user,
  categories,
}: {
  user: User;
  categories: number[];
}): Promise<FullProject[]> {
  const followedUsers = await getFollowedUsers(user.id);

  return getProjects({
    statuses: [ProjectStatus.PUBLISHED],
    isSecure: false,
    order: { createdAt: 'desc' },
    ...(categories.length && { categories }),
    categoriesSet: 'union',
    userId: followedUsers.map(({ id }) => id),
  });
}
