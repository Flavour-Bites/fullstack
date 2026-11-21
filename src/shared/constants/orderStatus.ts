export const STATUS_EMOJI: Record<string, string> = {
  Received: '📬',
  Designing: '✏️',
  Priced: '💰',
  Confirmed: '✅',
  InProgress: '🔥',
  Ready: '🎂',
  Completed: '🌟',
  Cancelled: '❌',
};

export const STATUS_LABEL: Record<string, string> = {
  Received: 'Request Received',
  Designing: 'Being Designed',
  Priced: 'Price Ready',
  Confirmed: 'Order Confirmed',
  InProgress: 'Being Baked',
  Ready: 'Ready for Pickup / Delivery',
  Completed: 'Order Completed',
  Cancelled: 'Cancelled',
};

export const ORDER_WORKFLOW = [
  'Received',
  'Designing',
  'Priced',
  'Confirmed',
  'InProgress',
  'Ready',
  'Completed',
] as const;

export function getNextOrderStatus(current: string): string | null {
  const idx = (ORDER_WORKFLOW as readonly string[]).indexOf(current);
  return idx >= 0 && idx < ORDER_WORKFLOW.length - 1 ? ORDER_WORKFLOW[idx + 1] : null;
}

export function orderPrice(r: { finalPrice?: number | null; price?: number | null }): number {
  return r.finalPrice ?? r.price ?? 0;
}
