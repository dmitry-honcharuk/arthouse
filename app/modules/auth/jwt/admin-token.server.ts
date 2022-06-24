import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import type { WithUser } from '~/modules/users/types/with-user';
import { signJWT, verifyJWT } from './jwt.server';

export interface Payload {
  user: Pick<UserWithProfile, 'id' | 'email' | 'profile'>;
}

export function getAdminToken({ user: { id, email, profile } }: WithUser) {
  const payload: Payload = {
    user: { id, email, profile },
  };

  return signJWT(payload);
}

export function verifyAdminToken(token: string): Payload | null {
  try {
    const {
      user: { id, email, profile },
    } = verifyJWT<Payload>(token);

    return { user: { id, email, profile } };
  } catch (e) {
    return null;
  }
}
