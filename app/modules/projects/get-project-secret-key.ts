import { z } from 'zod';

export function getProjectSecretKey() {
  return z
    .string({ invalid_type_error: 'No project password key' })
    .length(32, 'Key should be 32 chars long')
    .parse(process.env.PROJECT_PASSWORD_KEY);
}
