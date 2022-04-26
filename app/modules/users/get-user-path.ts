import type { UserWithProfile } from './types/user-with-profile';

export function getUserPath(user: UserWithProfile) {
  return user.profile?.nickname || user.id;
}
