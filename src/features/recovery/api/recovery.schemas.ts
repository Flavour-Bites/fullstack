import { z } from 'zod';

export const recoveryCreateSchema = z.object({
  oldTelegramId: z.string().min(1),
  newTelegramId: z.string().min(1),
});

export const recoveryUpdateSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
});
