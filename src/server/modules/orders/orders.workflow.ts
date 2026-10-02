import type { OrderStatus } from '@prisma/client';

export const ORDER_WORKFLOW: OrderStatus[] = [
  'Received',
  'Designing',
  'Priced',
  'Confirmed',
  'InProgress',
  'Ready',
  'Completed',
];

export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Received: ['Designing', 'Cancelled'],
  Designing: ['Priced', 'Cancelled'],
  Priced: ['Confirmed', 'Cancelled'],
  Confirmed: ['InProgress', 'Cancelled'],
  InProgress: ['Ready'],
  Ready: ['Completed'],
  Completed: [],
  Cancelled: [],
};

export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function normalizeMoney(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed);
}
