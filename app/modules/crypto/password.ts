import { compare, genSalt, hash } from 'bcryptjs';

export async function hashPassword(raw: string): Promise<string> {
  const salt = await genSalt(10);

  return hash(raw, salt);
}

export async function checkPassword(
  raw: string,
  hash: string
): Promise<boolean> {
  return compare(raw, hash);
}
