import { createCipheriv, randomBytes } from 'crypto';
import type { Encrypted } from '~/modules/crypto/types/encrypted';

export async function encrypt(data: string, key: string): Promise<Encrypted> {
  const iv = randomBytes(16);

  const cipher = createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');

  encrypted += cipher.final('hex');

  encrypted += cipher.getAuthTag().toString('hex');

  return {
    iv: iv.toString('hex'),
    content: encrypted,
  };
}
