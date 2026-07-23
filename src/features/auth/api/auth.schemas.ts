import { z } from 'zod';

export const oidcCallbackSchema = z.object({
  code: z.string().min(1, 'Authorization code is required.'),
  state: z.string().min(1, 'State is required.'),
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
