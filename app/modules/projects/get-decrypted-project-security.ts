import type { ProjectSecurity } from '@prisma/client';
import { z } from 'zod';
import { decrypt } from '~/modules/crypto/decrypt.server';
import type { DecryptedProjectSecurity } from '~/modules/projects/types/decrypted-project-security';

export async function getDecryptedProjectSecurity({
  passwordIv,
  passwordHash,
  ...security
}: ProjectSecurity): Promise<DecryptedProjectSecurity> {
  const secretKey = z.string().parse(process.env.PROJECT_PASSWORD_KEY);

  return {
    ...security,
    password: await decrypt(
      { content: passwordHash, iv: passwordIv },
      secretKey
    ),
  };
}
