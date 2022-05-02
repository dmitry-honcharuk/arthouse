import { Save } from '@mui/icons-material';
import { Button } from '@mui/material';
import type { Project } from '@prisma/client';
import { Form } from '@remix-run/react';
import type { FC } from 'react';
import * as React from 'react';
import { ProjectsAutocompleteField } from '~/modules/projects/components/projects-autocomplete-field';

interface Props {
  onSubmit: () => void;
  onCancel: () => void;
  allProjects: Project[];
  defaultProjects?: Project[];
}

export const AlbumProjectsForm: FC<Props> = ({
  onSubmit,
  onCancel,
  allProjects,
  defaultProjects,
}) => {
  return (
    <Form method="put" className="flex flex-col gap-4" onSubmit={onSubmit}>
      <input type="hidden" name="fields" value="projects" />
      <ProjectsAutocompleteField
        allProjects={allProjects}
        defaultProjects={defaultProjects}
      />
      <div className="flex justify-end gap-2 items-center">
        <Button
          variant="outlined"
          type="button"
          size="small"
          color="inherit"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          variant="outlined"
          type="submit"
          startIcon={<Save />}
          size="small"
        >
          Update
        </Button>
      </div>
    </Form>
  );
};
