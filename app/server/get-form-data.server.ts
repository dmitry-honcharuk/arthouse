import { unstable_parseMultipartFormData } from '@remix-run/node';
import { uploadHandler } from '~/upload-handler.server';

export async function getRequestFormData(request: Request) {
  const contentType = request.headers.get('content-type');

  return contentType?.includes('multipart/form-data')
    ? await unstable_parseMultipartFormData(request, uploadHandler)
    : await request.formData();
}
