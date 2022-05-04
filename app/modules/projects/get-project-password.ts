import type { ProjectSecurity } from '@prisma/client';
import { getDecryptedProjectSecurity } from '~/modules/projects/get-decrypted-project-security';

export async function getProjectPassword(
  security: ProjectSecurity
): Promise<string> {
  const { password } = await getDecryptedProjectSecurity(security);

  return password;
}
