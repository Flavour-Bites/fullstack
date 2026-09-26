import { getPrisma } from '../../platform/config/prisma';
import { makeId } from '../../../shared/utils/ids';
import { slugifyCategoryName } from '../../../shared/utils/categories';
import { ValidationError } from '../../platform/errors/index';

export const productsRepository = {
  async findAll(categorySlug?: string, includeInactive = false) {
    const prisma = getPrisma();
    return prisma.product.findMany({
      where: {
        ...(categorySlug && categorySlug !== 'all'
          ? { category: { slug: categorySlug, ...(includeInactive ? {} : { isActive: true }) } }
          : { ...(includeInactive ? {} : { category: { isActive: true } }) }),
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async resolveCategoryId(input: { categoryId?: string; categorySlug?: string; category?: string }) {
    const prisma = getPrisma();
    if (input.categoryId) return input.categoryId;

    const raw = input.categorySlug ?? input.category ?? 'celebration';
    const slug = slugifyCategoryName(raw);
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) return existing.id;

    throw new ValidationError(`Category "${raw}" does not exist. Please create it first.`);
  },

  async create(data: {
    id?: string;
    name: string;
    description: string;
    categoryId: string;
    flavors: string[];
    priceEstimate: string;
    image: string;
    imagePublicId?: string | null;
    servingCount?: string;
    tags: string[];
    isActive?: boolean;
  }) {
    const prisma = getPrisma();
    return prisma.product.create({
      data: {
        id: data.id || makeId('prod'),
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        flavors: data.flavors,
        priceEstimate: data.priceEstimate,
        image: data.image,
        imagePublicId: data.imagePublicId ?? null,
        servingCount: data.servingCount || 'Ask us',
        tags: data.tags,
        isActive: data.isActive ?? true,
      },
      include: { category: true },
    });
  },

  async update(id: string, data: Record<string, unknown>) {
    const prisma = getPrisma();
    return prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });
  },

  async delete(id: string) {
    const prisma = getPrisma();
    return prisma.product.delete({ where: { id } });
  },

  async findById(id: string) {
    const prisma = getPrisma();
    return prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  },
};
