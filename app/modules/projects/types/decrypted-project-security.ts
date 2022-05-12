import type { ProjectSecurity } from '@prisma/client';
import type { WithDecryptedPassword } from '~/modules/crypto/types/with-decrypted-password';

export type DecryptedProjectSecurity = WithDecryptedPassword<ProjectSecurity>;
