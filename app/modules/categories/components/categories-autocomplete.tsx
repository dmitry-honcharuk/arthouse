import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { Autocomplete, Checkbox, TextField } from '@mui/material';
import type { AutocompleteRenderGetTagProps } from '@mui/material/Autocomplete/Autocomplete';
import type { Category } from '@prisma/client';
import type { FC, ReactNode } from 'react';
import * as React from 'react';
import { useRef } from 'react';

type Props = {
  allCategories: Category[];
  onChange: (ids: number[]) => void;
  selectedCategories?: Category[];
  defaultCategories?: Category[];
  renderTags?: (
    value: number[],
    getTagProps: AutocompleteRenderGetTagProps
  ) => ReactNode;
};

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

export const CategoriesAutocomplete: FC<Props> = ({
  allCategories,
  onChange,
  selectedCategories,
  defaultCategories,
  renderTags,
}) => {
  const idMap = useRef(new Map(allCategories.map((c) => [c.id, c])));

  return (
    <Autocomplete
      multiple
      options={allCategories.map(({ id }) => id)}
      value={selectedCategories?.map(({ id }) => id)}
      defaultValue={defaultCategories?.map(({ id }) => id)}
      renderTags={renderTags}
      renderOption={(props, option, { selected }) => {
        const category = idMap.current.get(option);

        return (
          <li {...props}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              sx={{ mr: 1 }}
              checked={selected}
            />
            {category?.name}
          </li>
        );
      }}
      getOptionLabel={(option) =>
        idMap.current.get(option)?.name ?? 'unknown category'
      }
      onChange={(_, value) => onChange(value)}
      disableCloseOnSelect
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          label="Select categories"
          placeholder="Categories"
        />
      )}
    />
  );
};
