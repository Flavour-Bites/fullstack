import { z } from 'zod';

export const orderStatusEnum = z.enum([
  'Received',
  'Designing',
  'Quoted',
  'Confirmed',
  'InProgress',
  'Ready',
  'Completed',
  'Cancelled',
]);

export const createOrderSchema = z.object({
  id: z.string().optional(),
  contactName: z.string().min(2, 'Please enter your name.'),
  contactPhone: z.string().min(5, 'Please enter your phone number.'),
  eventType: z.string().min(1, 'Please choose the cake occasion.'),
  guestCount: z.coerce.number().int().min(1, 'Guest count must be at least 1.'),
  deliveryOption: z.string().optional(),
  deliveryAddress: z.string().optional().nullable(),
  deliveryDate: z.string().min(1, 'Please choose the date you need the cake.'),
  designStyle: z.string().optional().nullable(),
  flavor: z.string().min(1, 'Please choose a cake flavor.'),
  tierCount: z.coerce.number().int().min(1).max(6),
  specialInstructions: z.string().optional().nullable(),
  requestDate: z.string().optional(),
  referenceImage: z.string().optional().nullable(),
  referenceImagePublicId: z.string().optional().nullable(),
  referenceImageFormat: z.string().optional().nullable(),
  referenceImageBytes: z.coerce.number().int().optional().nullable(),
});

export const updateOrderSchema = z.object({
  status: orderStatusEnum.optional(),
  quotedPrice: z.union([z.number(), z.string()]).optional(),
  finalPrice: z.union([z.number(), z.string()]).optional(),
  depositAmount: z.union([z.number(), z.string()]).optional(),
  depositPaidAt: z.string().optional().nullable(),
  priceConfirmedAt: z.string().optional().nullable(),
  designStyle: z.string().optional(),
  specialInstructions: z.string().optional().nullable(),
  bakerNote: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

export const acceptPriceSchema = z.object({});
