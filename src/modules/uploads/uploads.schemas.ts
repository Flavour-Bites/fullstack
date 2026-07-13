import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const imageUploadSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1).refine(
    (type) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(type),
    'Only JPEG, PNG, WebP, and GIF images are allowed.',
  ),
  size: z.coerce.number().int().positive().max(MAX_FILE_SIZE, 'File size must be under 10MB.'),
  dataBase64: z.string().min(1),
});

export const imageDeleteSchema = z.object({
  publicId: z.string().min(1),
});
