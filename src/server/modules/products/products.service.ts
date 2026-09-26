import { productsRepository } from './products.repository';
import { deleteImageFromCloudinary } from '../../platform/integrations/cloudinary/cloudinaryClient';
import type { ProductInput, ProductUpdateInput } from './products.schemas';

export const productsService = {
  async findAll(categorySlug?: string, includeInactive = false) {
    return productsRepository.findAll(categorySlug, includeInactive);
  },

  async findById(id: string) {
    return productsRepository.findById(id);
  },

  async create(data: ProductInput) {
    const categoryId = await productsRepository.resolveCategoryId(data);

    return productsRepository.create({
      id: data.id,
      name: data.name,
      description: data.description,
      categoryId,
      flavors: data.flavors,
      priceEstimate: data.priceEstimate,
      image: data.image,
      imagePublicId: data.imagePublicId,
      servingCount: data.servingCount,
      tags: data.tags,
      isActive: data.isActive ?? true,
    });
  },

  async update(id: string, data: ProductUpdateInput) {
    const { categoryId, categorySlug, category, id: _id, ...fields } = data;

    const resolvedCategoryId = (categoryId || categorySlug || category)
      ? await productsRepository.resolveCategoryId(data)
      : undefined;

    return productsRepository.update(id, {
      ...fields,
      ...(resolvedCategoryId !== undefined && { categoryId: resolvedCategoryId }),
    });
  },

  async delete(id: string) {
    const item = await productsRepository.findById(id);
    if (item?.imagePublicId) {
      deleteImageFromCloudinary(item.imagePublicId).catch((err: Error) =>
        console.error('[Cloudinary] Delete failed:', err.message),
      );
    }
    return productsRepository.delete(id);
  },
};
