import type { Category } from '@prisma/client';

export interface WithCategories {
  categories: Category[];
}
