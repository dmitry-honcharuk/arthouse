import type { SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import { signJWT, verifyJWT } from '~/modules/auth/jwt';
import { decrypt } from '~/modules/crypto/decrypt.server';
import { encrypt } from '~/modules/crypto/encrypt.server';

interface Options {
  email: string;
  linkDomain: string;
}

const JWT_CONFIG: SignOptions = {
  expiresIn: '10m',
};

const MAGIC_LINK_ENCRYPTION_KEY = z
  .string()
  .parse(process.env.MAGIC_LINK_ENCRYPTION_KEY);

export async function generateMagicLink({
  email,
  linkDomain,
}: Options): Promise<string> {
  const token = signJWT({ email }, JWT_CONFIG);

  const encrypted = await encrypt(token, MAGIC_LINK_ENCRYPTION_KEY);

  return `${linkDomain}/authenticate?m=${encrypted.content}.${encrypted.iv}`;
}

export async function resolveMagicLink(
  link: string
): Promise<null | { email: string }> {
  const magicQuery = new URL(link).searchParams.get('m');

  if (!magicQuery) {
    return null;
  }

  const [content, iv] = magicQuery.split('.');

  const decryptedToken = await decrypt(
    { content, iv },
    MAGIC_LINK_ENCRYPTION_KEY
  );

  const { email } = verifyJWT<{ email: string }>(decryptedToken);

  return { email };
}
