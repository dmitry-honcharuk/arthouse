import type { WithEncryptedPassword } from '~/modules/crypto/types/with-encrypted-password';

export interface WithEncryptedSecurity {
  isSecure: boolean;
  security: WithEncryptedPassword | null;
}
