import type { Tag } from '@prisma/client';

export interface WithTags {
  tags: Tag[];
}
