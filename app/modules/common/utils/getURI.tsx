import slugify from 'slugify';

export function getURI(value: string): string {
  return slugify(value, { lower: true });
}
