import type { WithEncryptedPassword } from '~/modules/crypto/types/with-encrypted-password';
import type { WithEncryptedSecurity } from './with-encrypted-security';

export interface SecuredEncrypted extends WithEncryptedSecurity {
  isSecure: true;
  security: WithEncryptedPassword;
}
