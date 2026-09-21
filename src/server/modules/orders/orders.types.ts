import type { OrderStatus } from '@prisma/client';

export type OrderActorSource = 'admin_api' | 'staff_api' | 'customer_api' | 'telegram_bot' | 'system';

export type OrderActor = {
  userId?: string | null;
  source: OrderActorSource;
  note?: string | null;
};

export type OrderUpdateInput = {
  status?: OrderStatus;
  quotedPrice?: number | string;
  finalPrice?: number | string;
  depositAmount?: number | string;
  depositPaidAt?: string | null;
  priceConfirmedAt?: string | null;
  designStyle?: string;
  specialInstructions?: string | null;
  bakerNote?: string | null;
  note?: string | null;
};
