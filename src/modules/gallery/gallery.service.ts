import { galleryRepository } from './gallery.repository.js';
import { deleteImageFromCloudinary } from '../../integrations/cloudinary/cloudinaryClient.js';

export const galleryService = {
  async findAll(categorySlug?: string) {
    return galleryRepository.findAll(categorySlug);
  },

  async create(data: Record<string, unknown>) {
    const categoryId = await galleryRepository.resolveCategoryId(data as any);
    const flavors = Array.isArray(data.flavors) ? data.flavors : [data.flavors];
    const tags = Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [];

    return galleryRepository.create({
      id: data.id as string | undefined,
      name: data.name as string,
      description: data.description as string,
      categoryId,
      flavors,
      priceEstimate: data.priceEstimate as string,
      image: data.image as string | undefined,
      imagePublicId: data.imagePublicId as string | null | undefined,
      servingCount: data.servingCount as string | undefined,
      tags,
    });
  },

  async update(id: string, data: Record<string, unknown>) {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.categoryId || data.categorySlug || data.category) {
      updateData.categoryId = await galleryRepository.resolveCategoryId(data as any);
    }
    if (data.flavors !== undefined) {
      updateData.flavors = Array.isArray(data.flavors) ? data.flavors : [data.flavors];
    }
    if (data.priceEstimate !== undefined) updateData.priceEstimate = data.priceEstimate;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.imagePublicId !== undefined) updateData.imagePublicId = data.imagePublicId;
    if (data.servingCount !== undefined) updateData.servingCount = data.servingCount;
    if (data.tags !== undefined) {
      updateData.tags = Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [];
    }

    return galleryRepository.update(id, updateData);
  },

  async delete(id: string) {
    const item = await galleryRepository.findById(id);
    if (item?.imagePublicId) {
      deleteImageFromCloudinary(item.imagePublicId).catch((err: Error) =>
        console.error('[Cloudinary] Delete failed:', err.message),
      );
    }
    return galleryRepository.delete(id);
  },
};
