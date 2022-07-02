import type { Admin } from '@prisma/client';
import type { WithRoles } from '~/modules/auth/types/with-roles';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import type { WithUser } from '~/modules/users/types/with-user';
import type { WithPermissions } from '../types/with-permissions';
import { signJWT, verifyJWT } from './jwt.server';

export interface Payload extends WithPermissions {
  user: Pick<UserWithProfile, 'id' | 'email' | 'profile'>;
}

export function getAdminToken(
  admin: Admin & WithUser & WithRoles & WithPermissions
) {
  const {
    user: { id, email, profile },
    roles,
    permissions,
  } = admin;

  const payload: Payload = {
    user: { id, email, profile },
    permissions: [
      ...new Set([
        ...permissions,
        ...roles.flatMap(({ permissions }) => permissions),
      ]),
    ],
  };

  return signJWT(payload);
}

export function verifyAdminToken(token: string): Payload | null {
  try {
    const { user, permissions } = verifyJWT<Payload>(token);

    return { user, permissions };
  } catch (e) {
    return null;
  }
}
