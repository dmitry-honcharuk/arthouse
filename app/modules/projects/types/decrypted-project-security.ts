import type { ProjectSecurity } from '@prisma/client';

export interface DecryptedProjectSecurity
  extends Omit<ProjectSecurity, 'passwordHash' | 'passwordIv'> {
  password: string;
}
