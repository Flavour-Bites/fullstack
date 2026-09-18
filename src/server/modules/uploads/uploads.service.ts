import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../../platform/integrations/cloudinary/cloudinaryClient';
import type { ImageUploadInput } from '../../platform/integrations/cloudinary/cloudinaryClient';

export const uploadsService = {
  async uploadImage(input: ImageUploadInput) {
    const image = await uploadImageToCloudinary(input);
    return image;
  },

  async deleteImage(publicId: string) {
    return deleteImageFromCloudinary(publicId);
  },
};
