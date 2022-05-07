import { createDecipheriv } from 'crypto';
import { separateAuthTag } from '~/modules/crypto/separate-auth-tag.server';
import type { Encrypted } from '~/modules/crypto/types/encrypted';

export async function decrypt(
  encrypted: Encrypted,
  key: string
): Promise<string> {
  const [content, authTag] = separateAuthTag(
    Buffer.from(encrypted.content, 'hex')
  );

  const decipher = createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(encrypted.iv, 'hex')
  );

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(content, undefined, 'utf8');

  decrypted += decipher.final('utf8');

  return decrypted;
}
