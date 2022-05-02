import {
  Autocomplete,
  Chip,
  ListItemButton,
  ListItemText,
  TextField,
} from '@mui/material';
import type { Project } from '@prisma/client';
import type { FC } from 'react';
import * as React from 'react';
import { useRef } from 'react';

type Props = {
  projects: Project[];
  onChange: (ids: string[]) => void;
  defaultProjects?: Project[];
};

export const ProjectsAutocomplete: FC<Props> = ({
  projects,
  onChange,
  defaultProjects,
}) => {
  const projectIdMap = useRef(new Map(projects.map((p) => [p.id, p])));

  return (
    <Autocomplete
      multiple
      options={projects.map(({ id }) => id)}
      defaultValue={defaultProjects ? defaultProjects.map(({ id }) => id) : []}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            label={projectIdMap.current.get(option)?.name ?? 'unknown project'}
            variant="outlined"
            color="primary"
          />
        ))
      }
      renderOption={(props, option) => {
        const project = projectIdMap.current.get(option);

        return (
          <ListItemButton {...props} component="li" key={project?.id ?? option}>
            <ListItemText primary={project?.name ?? 'unknown project'} />
          </ListItemButton>
        );
      }}
      getOptionLabel={(option) =>
        projectIdMap.current.get(option)?.name ?? 'unknown project'
      }
      onChange={(event, value) => onChange(value)}
      disableCloseOnSelect
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          label="Include projects"
          placeholder="Projects"
        />
      )}
    />
  );
};
