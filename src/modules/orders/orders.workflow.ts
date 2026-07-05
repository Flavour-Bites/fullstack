import type { OrderStatus } from '@prisma/client';

export const ORDER_WORKFLOW: OrderStatus[] = [
  'Received',
  'Designing',
  'Quoted',
  'Confirmed',
  'InProgress',
  'Ready',
  'Completed',
];

export type PaymentInput = {
  finalPrice?: number | null;
  depositAmount?: number | null;
};

export function normalizeMoney(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed);
}

export function calculatePaymentState(input: PaymentInput) {
  const finalPrice = Math.max(0, input.finalPrice ?? 0);
  const depositAmount = Math.max(0, input.depositAmount ?? 0);

  if (depositAmount > finalPrice && finalPrice > 0) {
    throw new Error('Money paid cannot be more than the final cake price.');
  }

  const remainingBalance = Math.max(finalPrice - depositAmount, 0);
  const paymentStatus: 'unpaid' | 'partial' | 'paid' =
    finalPrice <= 0 || depositAmount <= 0
      ? 'unpaid'
      : remainingBalance === 0
        ? 'paid'
        : 'partial';

  return { depositAmount, remainingBalance, paymentStatus };
}
