import type { WithDecryptedPassword } from '~/modules/crypto/types/with-decrypted-password';

export type WithDecryptedSecurity = {
  isSecure: boolean;
  security: WithDecryptedPassword | null;
};
