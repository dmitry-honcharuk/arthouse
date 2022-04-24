import { ProjectItemType } from '@prisma/client';
import { z } from 'zod';
import { validateFormData } from '~/modules/validation/validate-form-data';

export function validateCreateItemFormData(formData: FormData) {
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
        image: z.string(),
      }),
      z.object({
        ...commonFields,
        type: z.literal(ProjectItemType.YOUTUBE),
        url: z.string(),
      }),
    ])
  );
}
