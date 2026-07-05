import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../../integrations/cloudinary/cloudinaryClient.js';
import type { ImageUploadInput } from '../../integrations/cloudinary/cloudinaryClient.js';

export const uploadsService = {
  async uploadImage(input: ImageUploadInput) {
    const image = await uploadImageToCloudinary(input);
    return image;
  },

  async deleteImage(publicId: string) {
    return deleteImageFromCloudinary(publicId);
  },
};
