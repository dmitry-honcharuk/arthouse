import { unstable_parseMultipartFormData } from '@remix-run/node';
import { castArray } from 'lodash';
import type { z, ZodSchema } from 'zod';
import { uploadHandler } from '~/server/upload-handler.server';

export class FormDataHandler {
  private formData: FormData | null = null;

  static async getRequestFormData(request: Request) {
    const contentType = request.headers.get('content-type');

    return contentType?.includes('multipart/form-data')
      ? unstable_parseMultipartFormData(request, uploadHandler)
      : request.formData();
  }

  static validateFormData<T extends ZodSchema>(
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

  constructor(private request: Request) {}

  async getFormData() {
    if (!this.formData) {
      this.formData = await FormDataHandler.getRequestFormData(this.request);
    }

    return this.formData;
  }

  async validate<T extends ZodSchema>(schema: T) {
    const formData = await this.getFormData();

    return FormDataHandler.validateFormData(formData, schema);
  }
}
