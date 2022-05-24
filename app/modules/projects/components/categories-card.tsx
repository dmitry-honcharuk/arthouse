import type { Category, Project } from '@prisma/client';
import type { FC } from 'react';
import * as React from 'react';
import type { WithCategories } from '~/modules/categories/types/with-categories';
import { ProjectCategoriesForm } from '~/modules/projects/components/project-categories-form';
import { SidebarCardContent } from '~/modules/projects/components/sidebar-card-content';

export const CategoriesCard: FC<{
  project: Project & WithCategories;
  action: string;
  isCurrentUser: boolean;
  categories: Category[];
}> = ({ project, action, isCurrentUser, categories }) => {
  return (
    <SidebarCardContent isCurrentUser={isCurrentUser} title="Categories">
      {({ isEdit }) => (
        <ProjectCategoriesForm
          project={project}
          action={action}
          isCurrentUser={isCurrentUser}
          isEdit={isEdit}
          categories={categories}
        />
      )}
    </SidebarCardContent>
  );
};
