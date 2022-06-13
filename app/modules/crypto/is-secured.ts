import type { SecuredEncrypted } from './types/secured-encrypted';
import type { WithEncryptedSecurity } from './types/with-encrypted-security';

export function isSecured(
  entity: Partial<WithEncryptedSecurity>
): entity is SecuredEncrypted {
  return !!entity.isSecure && !!entity.security;
}
