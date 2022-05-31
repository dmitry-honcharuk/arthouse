import { prisma } from '~/db.server';

export function getCategories() {
  return prisma.category.findMany();
}
