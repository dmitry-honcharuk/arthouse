import type { Collection } from '@prisma/client';

export interface WithCollections {
  collections: Collection[];
}
