import { castArray } from 'lodash';
import type { z, ZodSchema } from 'zod';

/**
 * @deprecated - use FormDataHandler
 */
export function validateFormData<T extends ZodSchema>(
  formData: FormData,
  schema: T
): z.infer<T> {
  return schema.parse(
    [...formData.entries()].reduce<Record<string, any>>(
      (result, [key, value]) => {
        const existing = result[key];

        if (!existing) {
          return {
            ...result,
            [key]: value,
          };
        }

        return {
          ...result,
          [key]: [...castArray(existing), value],
        };
      },
      {}
    )
  );
}
