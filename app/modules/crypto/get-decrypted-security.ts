import { z } from 'zod';
import { decrypt } from '~/modules/crypto/decrypt.server';
import type { WithDecryptedPassword } from '~/modules/crypto/types/with-decrypted-password';
import type { WithEncryptedPassword } from '~/modules/crypto/types/with-encrypted-password';

export async function getDecryptedSecurity<T extends WithEncryptedPassword>({
  passwordIv,
  passwordHash,
  ...security
}: T): Promise<WithDecryptedPassword<T>> {
  const secretKey = z.string().parse(process.env.PROJECT_PASSWORD_KEY);

  return {
    ...security,
    password: await decrypt(
      { content: passwordHash, iv: passwordIv },
      secretKey
    ),
  };
}
