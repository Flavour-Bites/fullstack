import { z } from 'zod';

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  description: z.string().min(2),
  categoryId: z.string().optional(),
  categorySlug: z.string().optional(),
  category: z.string().optional(),
  flavors: z.array(z.string().min(1)).min(1, 'At least one flavor is required'),
  priceEstimate: z.string().min(1),
  image: z.string().url(),
  imagePublicId: z.string().optional().nullable(),
  servingCount: z.string().optional(),
  tags: z.array(z.string().min(1)).default([]),
  isActive: z.boolean().optional(),
});

export const productUpdateSchema = productSchema.partial();

export type ProductInput = z.infer<typeof productSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
