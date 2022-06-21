import type { ProjectStatus } from '@prisma/client';
import { intersection } from 'lodash';
import { prisma } from '~/db.server';
import type { FullProject } from '~/modules/projects/types/full-project';

type SortOrder = 'asc' | 'desc';

type ItemsSetType = 'intersection' | 'union';

interface Details {
  name?: string;
  statuses?: ProjectStatus[];
  userId?: string | string[];
  isSecure?: boolean;
  ids?: { include?: string[]; exclude?: string[] };
  order?: { favoriteCount?: SortOrder; createdAt?: SortOrder };
  tags?: string[];
  categories?: number[];
  categoriesSet?: ItemsSetType;
  explicit?: boolean;
}

export async function getProjects(details?: Details): Promise<FullProject[]> {
  const categoriesSetType = details?.categoriesSet ?? 'intersection';

  const [projectIdsByTags, projectIdsByCategories] = await Promise.all([
    details?.tags ? getProjectsIdsByTags(details.tags) : null,
    details?.categories
      ? getProjectsIdsByCategories(details.categories, categoriesSetType)
      : null,
  ]);

  const projectIds =
    projectIdsByTags && projectIdsByCategories
      ? intersection(projectIdsByTags, projectIdsByCategories)
      : projectIdsByTags ?? projectIdsByCategories ?? null;

  return prisma.project.findMany({
    where: {
      id: {
        in: projectIds ?? details?.ids?.include,
        notIn: details?.ids?.exclude,
      },
      name: {
        contains: details?.name,
        mode: 'insensitive',
      },
      ...(details?.statuses && {
        status: { in: details.statuses },
      }),
      userId: Array.isArray(details?.userId)
        ? { in: details?.userId }
        : details?.userId,
      isSecure: details?.isSecure,
      explicit: details?.explicit,
    },
    include: {
      items: true,
      user: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: details?.order,
  });
}

async function getProjectsIdsByTags(tagNames: string[]): Promise<string[]> {
  const uniqueTags = [...new Set(tagNames.map((t) => t.toLowerCase().trim()))];

  const tags = await prisma.tag.findMany({
    where: { name: { in: uniqueTags, mode: 'insensitive' } },
    include: { projects: { select: { id: true } } },
  });

  const existingTagNames = tags.map(({ name }) => name.toLowerCase());

  if (!uniqueTags.every((tagName) => existingTagNames.includes(tagName))) {
    return [];
  }

  const allProjectIds = [
    ...new Set(tags.flatMap(({ projects }) => projects).map(({ id }) => id)),
  ];

  const projectsByTags = new Map<string, Set<string>>();

  tags.forEach(({ name, projects }) => {
    const tagName = name.toLowerCase();

    const projectIds = projectsByTags.get(tagName) ?? new Set();

    projects.forEach(({ id }) => projectIds.add(id));

    projectsByTags.set(tagName, projectIds);
  });

  const projectIds = [...projectsByTags.values()];

  return allProjectIds.filter((id) => projectIds.every((ids) => ids.has(id)));
}

async function getProjectsIdsByCategories(
  categoryIds: number[],
  itemSetType: ItemsSetType
): Promise<string[]> {
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    include: { projects: { select: { id: true } } },
  });

  const allProjectIds = [
    ...new Set(
      categories.flatMap(({ projects }) => projects).map(({ id }) => id)
    ),
  ];

  if (itemSetType === 'union') {
    return allProjectIds;
  }

  const projectsByCategories = new Map<number, Set<string>>();

  categories.forEach(({ id, projects }) => {
    const projectIds = projectsByCategories.get(id) ?? new Set();

    projects.forEach(({ id }) => projectIds.add(id));

    projectsByCategories.set(id, projectIds);
  });

  const projectIds = [...projectsByCategories.values()];

  return allProjectIds.filter((id) => projectIds.every((ids) => ids.has(id)));
}
