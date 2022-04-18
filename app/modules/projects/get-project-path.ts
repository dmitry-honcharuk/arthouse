import type { Project } from '@prisma/client';
import { getUserPath } from '../users/get-user-path';
import type { UserWithProfile } from '../users/types/social-user';

export function getProjectPath(
  project: Pick<Project, 'id' | 'slug'>,
  user?: UserWithProfile
) {
  const projectPath = project.slug || project.id;

  if (!user) {
    return projectPath;
  }

  return `${getUserPath(user)}/${projectPath}`;
}
