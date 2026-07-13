import { z } from 'zod';

export const gallerySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  description: z.string().min(2),
  categoryId: z.string().optional(),
  categorySlug: z.string().optional(),
  category: z.string().optional(),
  flavors: z.union([z.string(), z.array(z.string())]),
  priceEstimate: z.string().min(1),
  image: z.string().url().optional(),
  imagePublicId: z.string().optional().nullable(),
  servingCount: z.string().optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
});

export const galleryUpdateSchema = gallerySchema.partial();
