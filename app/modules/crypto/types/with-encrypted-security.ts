import type { WithEncryptedPassword } from '~/modules/crypto/types/with-encrypted-password';

export type WithEncryptedSecurity = {
  isSecure: boolean;
  security: WithEncryptedPassword | null;
};
