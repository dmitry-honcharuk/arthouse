import type { DecryptedProjectSecurity } from '~/modules/projects/types/decrypted-project-security';

export interface WithDecryptedProjectSecurity {
  security: DecryptedProjectSecurity | null;
}
