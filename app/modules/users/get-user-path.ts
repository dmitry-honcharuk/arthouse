import type { UserWithProfile } from './types/social-user';

export function getUserPath(user: UserWithProfile) {
  return user.profile?.nickname || user.id;
}
