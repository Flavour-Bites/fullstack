import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export const phoneSchema = z
  .string()
  .min(9, 'Please enter a valid phone number.')
  .max(20, 'Phone number is too long.');

export const optionalStringSchema = z.string().optional().nullable();
