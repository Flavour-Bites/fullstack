import { z } from 'zod';

export const imageUploadSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.coerce.number().int().positive(),
  dataBase64: z.string().min(1),
});

export const imageDeleteSchema = z.object({
  publicId: z.string().min(1),
});
