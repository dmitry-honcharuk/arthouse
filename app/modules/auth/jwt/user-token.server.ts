import type { User } from '@prisma/client';
import { signJWT, verifyJWT } from './jwt.server';

export interface UserPayload {
  id: string;
  email: string;
}

export function getUserToken(user: User) {
  return signJWT({
    id: user.id,
    email: user.email,
  });
}

export function verifyUserToken(token: string): UserPayload | null {
  try {
    const { id, email } = verifyJWT<UserPayload>(token);

    return { id, email };
  } catch (e) {
    return null;
  }
}
