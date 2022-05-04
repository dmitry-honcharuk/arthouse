import type { Project } from '@prisma/client';
import type { FC } from 'react';
import * as React from 'react';
import { useState } from 'react';
import { ProjectsAutocomplete } from '~/modules/projects/components/projects-autocomplete';

export const ProjectsAutocompleteField: FC<{
  allProjects: Project[];
  defaultProjects?: Project[];
}> = ({ allProjects, defaultProjects }) => {
  const [projectIds, setProjectIds] = useState<string[]>([]);

  return (
    <>
      {projectIds.map((id) => (
        <input key={id} type="hidden" name="projects" value={id} />
      ))}
      <ProjectsAutocomplete
        projects={allProjects}
        defaultProjects={defaultProjects}
        onChange={setProjectIds}
      />
    </>
  );
};
