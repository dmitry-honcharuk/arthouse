import type { Category } from '@prisma/client';
import type { FC } from 'react';
import * as React from 'react';
import { useState } from 'react';
import { CategoriesAutocomplete } from './categories-autocomplete';

export const CategoriesAutocompleteField: FC<{
  allCategories: Category[];
  defaultCategories?: Category[];
}> = ({ allCategories, defaultCategories }) => {
  const [ids, setIds] = useState<number[]>([]);

  return (
    <>
      {ids.map((id) => (
        <input key={id} type="hidden" name="categories" value={id} />
      ))}
      <CategoriesAutocomplete
        categories={allCategories}
        defaultCategories={defaultCategories}
        onChange={setIds}
      />
    </>
  );
};
