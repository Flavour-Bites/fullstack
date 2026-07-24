import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../../../integrations/cloudinary/cloudinaryClient';
import type { ImageUploadInput } from '../../../integrations/cloudinary/cloudinaryClient';

export const uploadsService = {
  async uploadImage(input: ImageUploadInput) {
    const image = await uploadImageToCloudinary(input);
    return image;
  },

  async deleteImage(publicId: string) {
    return deleteImageFromCloudinary(publicId);
  },
};
