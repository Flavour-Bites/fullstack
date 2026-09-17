import { galleryRepository } from './gallery.repository';
import { deleteImageFromCloudinary } from '../../../integrations/cloudinary/cloudinaryClient';
import { gallerySchema, galleryUpdateSchema } from './gallery.schemas';

export const galleryService = {
  async findAll(categorySlug?: string) {
    return galleryRepository.findAll(categorySlug);
  },

  async create(data: Record<string, unknown>) {
    const validatedData = gallerySchema.parse(data);
    const categoryId = await galleryRepository.resolveCategoryId(validatedData as any);
    const flavors = Array.isArray(validatedData.flavors) ? validatedData.flavors : [validatedData.flavors];
    const tags = Array.isArray(validatedData.tags) ? validatedData.tags : validatedData.tags ? [validatedData.tags] : [];

    return galleryRepository.create({
      id: validatedData.id,
      name: validatedData.name,
      description: validatedData.description,
      categoryId,
      flavors,
      priceEstimate: validatedData.priceEstimate,
      image: validatedData.image,
      imagePublicId: validatedData.imagePublicId,
      servingCount: validatedData.servingCount,
      tags,
    });
  },

  async update(id: string, data: Record<string, unknown>) {
    const validatedData = galleryUpdateSchema.parse(data);
    const updateData: Record<string, unknown> = {};

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.categoryId || validatedData.categorySlug || validatedData.category) {
      updateData.categoryId = await galleryRepository.resolveCategoryId(validatedData as any);
    }
    if (validatedData.flavors !== undefined) {
      updateData.flavors = Array.isArray(validatedData.flavors) ? validatedData.flavors : [validatedData.flavors];
    }
    if (validatedData.priceEstimate !== undefined) updateData.priceEstimate = validatedData.priceEstimate;
    if (validatedData.image !== undefined) updateData.image = validatedData.image;
    if (validatedData.imagePublicId !== undefined) updateData.imagePublicId = validatedData.imagePublicId;
    if (validatedData.servingCount !== undefined) updateData.servingCount = validatedData.servingCount;
    if (validatedData.tags !== undefined) {
      updateData.tags = Array.isArray(validatedData.tags) ? validatedData.tags : validatedData.tags ? [validatedData.tags] : [];
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
