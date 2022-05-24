import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import { Autocomplete, Checkbox, TextField } from '@mui/material';
import type { Category } from '@prisma/client';
import type { FC } from 'react';
import * as React from 'react';
import { useRef } from 'react';

type Props = {
  categories: Category[];
  onChange: (ids: number[]) => void;
  defaultCategories?: Category[];
};

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

export const CategoriesAutocomplete: FC<Props> = ({
  categories,
  onChange,
  defaultCategories,
}) => {
  const idMap = useRef(new Map(categories.map((c) => [c.id, c])));

  return (
    <Autocomplete
      multiple
      options={categories.map(({ id }) => id)}
      defaultValue={
        defaultCategories ? defaultCategories.map(({ id }) => id) : []
      }
      renderTags={() => null}
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
