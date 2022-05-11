import type { FC } from 'react';
import { ProjectItemCard } from '~/modules/projects/components/project-item';
import { getProjectPath } from '~/modules/projects/get-project-path';
import type { FullProject } from '~/modules/projects/types/full-project';
import type { ProjectWithItems } from '~/modules/projects/types/project-with-items';

export const ProjectItems: FC<{
  project: FullProject & ProjectWithItems;
  isCurrentUser: boolean;
}> = ({ isCurrentUser, project }) => {
  return (
    <div className="flex flex-col gap-10">
      {project.items.map((item) => {
        return (
          <ProjectItemCard
            key={item.id}
            item={item}
            project={project}
            isCurrentUser={isCurrentUser}
            deleteLink={`/${getProjectPath(project, project.user)}/${item.id}`}
          />
        );
      })}
    </div>
  );
};
