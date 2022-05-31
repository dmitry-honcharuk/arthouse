import { Stack, Typography } from '@mui/material';
import type { Category, Project } from '@prisma/client';
import { useFetcher } from '@remix-run/react';
import { orderBy } from 'lodash';
import type { FC } from 'react';
import * as React from 'react';
import { CategoriesAutocomplete } from '~/modules/categories/components/categories-autocomplete';
import { CategoryChip } from '~/modules/categories/components/category-chip';
import type { WithCategories } from '~/modules/categories/types/with-categories';

type Props = {
  project: Project & WithCategories;
  action: string;
  isCurrentUser: boolean;
  isEdit: boolean;
  categories: Category[];
};

export const ProjectCategoriesForm: FC<Props> = ({
  project,
  action,
  isCurrentUser,
  isEdit,
  categories,
}) => {
  const fetcher = useFetcher();

  const categoriesDisplay = project.categories.length ? (
    <Stack direction="row" gap={1} flexWrap="wrap">
      {orderBy(project.categories, ['name'], ['asc']).map(({ id, name }) => (
        <CategoryChip
          key={id}
          category={name}
          link={!isEdit ? `/search?categories=${id}` : undefined}
          onDelete={
            isCurrentUser && isEdit
              ? () => {
                  const formData = new FormData();

                  formData.set('fields', 'categories');

                  project.categories
                    .filter((cat) => cat.id !== id)
                    .forEach((cat) =>
                      formData.append('categories', `${cat.id}`)
                    );

                  fetcher.submit(formData, { method: 'put', action });
                }
              : undefined
          }
        />
      ))}
    </Stack>
  ) : (
    <Typography color="dimgray">No categories specified</Typography>
  );

  if (!isEdit) {
    return categoriesDisplay;
  }

  return (
    <fetcher.Form>
      <Stack spacing={2}>
        {isCurrentUser && (
          <CategoriesAutocomplete
            allCategories={categories}
            selectedCategories={project.categories}
            renderTags={() => null}
            onChange={(categories) => {
              const form = new FormData();

              form.set('fields', 'categories');

              categories.forEach(({ id }) =>
                form.append('categories', `${id}`)
              );

              fetcher.submit(form, { method: 'put', action });
            }}
          />
        )}
        {categoriesDisplay}
      </Stack>
    </fetcher.Form>
  );
};
