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
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priceEstimate !== undefined) updateData.priceEstimate = data.priceEstimate;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.imagePublicId !== undefined) updateData.imagePublicId = data.imagePublicId;
    if (data.servingCount !== undefined) updateData.servingCount = data.servingCount;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.flavors !== undefined) updateData.flavors = data.flavors;
    if (data.tags !== undefined) updateData.tags = data.tags;

    if (data.categoryId || data.categorySlug || data.category) {
      updateData.categoryId = await productsRepository.resolveCategoryId(data);
    }

    return productsRepository.update(id, updateData);
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
