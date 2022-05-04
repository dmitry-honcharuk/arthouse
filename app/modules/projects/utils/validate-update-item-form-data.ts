import { ProjectItemType } from '@prisma/client';
import { z } from 'zod';
import { validateFormData } from '~/server/validate-form-data.server';

export function validateUpdateItemFormData(formData: FormData) {
  const commonFields = {
    title: z.ostring(),
    caption: z.ostring(),
  };

  return validateFormData(
    formData,
    z.union([
      z.object({
        ...commonFields,
        type: z.literal(ProjectItemType.IMAGE),
        image: z.string().optional(),
      }),
      z.object({
        ...commonFields,
        type: z.literal(ProjectItemType.YOUTUBE),
        url: z.string().optional(),
      }),
    ])
  );
}
