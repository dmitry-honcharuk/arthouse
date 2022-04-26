import type { Project } from '@prisma/client';
import type { WithUser } from '~/modules/users/types/with-user';

export interface FullProject extends Project, WithUser {}
