import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { Autocomplete, Checkbox, TextField } from '@mui/material';
import type { AutocompleteRenderGetTagProps } from '@mui/material/Autocomplete/Autocomplete';
import type { Category } from '@prisma/client';
import type { FC, ReactNode } from 'react';
import * as React from 'react';

type Props = {
  allCategories: Category[];
  onChange: (categories: Category[]) => void;
  selectedCategories?: Category[];
  defaultCategories?: Category[];
  renderTags?: (
    value: Category[],
    getTagProps: AutocompleteRenderGetTagProps
  ) => ReactNode;
  limitTags?: number;
};

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

export const CategoriesAutocomplete: FC<Props> = ({
  allCategories,
  onChange,
  selectedCategories,
  defaultCategories,
  renderTags,
  limitTags,
}) => {
  return (
    <Autocomplete
      multiple
      options={allCategories}
      value={selectedCategories}
      defaultValue={defaultCategories}
      limitTags={limitTags}
      renderTags={renderTags}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderOption={(props, option, { selected }) => {
        return (
          <li {...props}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              sx={{ mr: 1 }}
              checked={selected}
            />
            {option.name}
          </li>
        );
      }}
      getOptionLabel={(option) => option.name ?? 'unknown category'}
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
