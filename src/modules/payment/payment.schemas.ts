import { z } from 'zod';

export const initiatePaymentSchema = z.object({
  orderId: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export const recordManualPaymentSchema = z.object({
  depositAmount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
  paymentMethod: z.string().optional().default('bank_transfer'),
  note: z.string().optional(),
});
