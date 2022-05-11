import type { WithEncryptedPassword } from '~/modules/crypto/types/with-encrypted-password';
import type { WithPassword } from '~/modules/crypto/types/with-password';

export type WithDecryptedPassword<
  T extends WithEncryptedPassword = WithEncryptedPassword
> = Omit<T, 'passwordHash' | 'passwordIv'> & WithPassword;
