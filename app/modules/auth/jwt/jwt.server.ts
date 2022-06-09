import type { SignOptions } from 'jsonwebtoken';
import { sign, TokenExpiredError, verify } from 'jsonwebtoken';
import { z } from 'zod';

function getJWTSecret(): string {
  return z.string().parse(process.env.JWT_SECRET);
}

export function signJWT(data: any, options?: SignOptions) {
  return sign(data, getJWTSecret(), options);
}

export function verifyJWT<T>(token: string): T {
  return verify(token, getJWTSecret()) as T;
}

export function isTokenExpiredError(
  error: unknown
): error is TokenExpiredError {
  return error instanceof TokenExpiredError;
}
