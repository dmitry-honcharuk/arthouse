import type { User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import invariant from 'tiny-invariant';

export interface UserPayload {
  id: string;
  email: string;
}

function getJWTSecret(): string {
  invariant(process.env.JWT_SECRET, 'No JWT_SECRET env specified');

  return process.env.JWT_SECRET;
}

export function getUserToken(user: User) {
  invariant(process.env.JWT_SECRET, 'No JWT_SECRET env specified');

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    getJWTSecret()
  );
}

export function verifyUserToken(token: string): UserPayload | null {
  try {
    const { id, email } = jwt.verify(token, getJWTSecret()) as UserPayload;

    return { id, email };
  } catch (e) {
    return null;
  }
}
