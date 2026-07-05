import { getPrisma } from '../../app/config/prisma.js';
import { makeId } from '../../shared/utils/ids.js';
import { slugifyCategoryName } from '../../shared/utils/categories.js';

export const categoriesRepository = {
  async findAll(includeInactive = false) {
    const prisma = getPrisma();
    return prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  },

  async create(data: {
    name: string;
    slug?: string;
    description?: string | null;
    color?: string | null;
    icon?: string | null;
    sortOrder?: number;
  }) {
    const prisma = getPrisma();
    return prisma.category.create({
      data: {
        id: makeId('cat'),
        name: data.name,
        slug: data.slug ? slugifyCategoryName(data.slug) : slugifyCategoryName(data.name),
        description: data.description ?? null,
        color: data.color ?? null,
        icon: data.icon ?? null,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  },

  async update(id: string, data: Record<string, unknown>) {
    const prisma = getPrisma();
    return prisma.category.update({
      where: { id },
      data: {
        ...data,
        ...(data.slug ? { slug: slugifyCategoryName(data.slug as string) } : {}),
      },
    });
  },

  async softDelete(id: string) {
    const prisma = getPrisma();
    return prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  },
};
