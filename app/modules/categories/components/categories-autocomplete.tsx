import type { AutocompleteRenderGetTagProps } from '@mui/material/Autocomplete/Autocomplete';
import type { Category } from '@prisma/client';
import type { FC, ReactNode } from 'react';
import * as React from 'react';
import { CheckboxAutocomplete } from '../../common/checkbox-autocomplete';

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

export const CategoriesAutocomplete: FC<Props> = ({
  allCategories,
  onChange,
  selectedCategories,
  defaultCategories,
  renderTags,
  limitTags,
}) => {
  return (
    <CheckboxAutocomplete
      options={allCategories}
      value={selectedCategories}
      defaultValue={defaultCategories}
      limitTags={limitTags}
      renderTags={renderTags}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => option.name ?? 'unknown category'}
      onChange={(_, value) => onChange(value)}
      TextFieldProps={{ label: 'Select categories', placeholder: 'Categories' }}
    />
  );
};
