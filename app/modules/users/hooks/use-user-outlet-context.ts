import { useOutletContext } from '@remix-run/react';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';

export function useUserOutletContext() {
  return useOutletContext<{
    user: UserWithProfile;
    isCurrentUser: boolean;
  }>();
}
