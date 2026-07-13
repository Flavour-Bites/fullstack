import { z } from 'zod';

export const telegramLoginSchema = z.object({
  id: z.number(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().optional(),
  auth_date: z.number(),
  hash: z.string(),
});

export const finalizeSchema = z.object({
  telegramId: z.string().min(1),
  password: z.string().min(1),
});

export const passwordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const telegramPasswordSchema = z.object({
  telegramId: z.string().min(1),
  password: z.string().min(1),
});
