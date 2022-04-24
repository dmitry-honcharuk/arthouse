import type { ProjectItem } from '@prisma/client';
import type { FC } from 'react';
import { ProjectItemCard } from '~/modules/projects/components/project-item';

export const ProjectItems: FC<{
  items: ProjectItem[];
  isCurrentUser: boolean;
}> = ({ items, isCurrentUser }) => {
  return (
    <div className="flex flex-col gap-10">
      {items.map((item) => (
        <ProjectItemCard
          key={item.id}
          item={item}
          isCurrentUser={isCurrentUser}
        />
      ))}
    </div>
  );
};
