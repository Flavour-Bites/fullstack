import { getPrisma } from '../../app/config/prisma.js';
import { makeId } from '../../shared/utils/ids.js';
import { slugifyCategoryName } from '../../shared/utils/categories.js';

export const galleryRepository = {
  async findAll(categorySlug?: string) {
    const prisma = getPrisma();
    return prisma.cakeGalleryItem.findMany({
      where: categorySlug && categorySlug !== 'all'
        ? { category: { slug: categorySlug, isActive: true } }
        : { category: { isActive: true } },
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

    throw new Error(`Category "${raw}" does not exist. Please create it first.`);
  },

  async create(data: {
    id?: string;
    name: string;
    description: string;
    categoryId: string;
    flavors: string[];
    priceEstimate: string;
    image?: string;
    imagePublicId?: string | null;
    servingCount?: string;
    tags: string[];
  }) {
    const prisma = getPrisma();
    return prisma.cakeGalleryItem.create({
      data: {
        id: data.id || makeId('gal'),
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        flavors: data.flavors,
        priceEstimate: data.priceEstimate,
        image: data.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800',
        imagePublicId: data.imagePublicId ?? null,
        servingCount: data.servingCount || 'Ask us',
        tags: data.tags,
      },
      include: { category: true },
    });
  },

  async update(id: string, data: Record<string, unknown>) {
    const prisma = getPrisma();
    return prisma.cakeGalleryItem.update({
      where: { id },
      data,
      include: { category: true },
    });
  },

  async delete(id: string) {
    const prisma = getPrisma();
    return prisma.cakeGalleryItem.delete({ where: { id } });
  },

  async findById(id: string) {
    const prisma = getPrisma();
    return prisma.cakeGalleryItem.findUnique({ where: { id } });
  },
};
