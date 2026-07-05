import { z } from 'zod';

export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  content: z.string().min(5),
  author: z.string().min(2),
  eventType: z.string().optional(),
  role: z.string().optional(),
  productId: z.string().optional().nullable(),
});
