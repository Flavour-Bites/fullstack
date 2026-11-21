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

export const STATUS_COLORS: Record<string, string> = {
  Received: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-900/40',
  Designing: 'bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-900/40',
  Priced: 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700',
  Confirmed: 'bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-900/40',
  InProgress: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-900/40',
  Ready: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-900/40',
  Completed: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-900/40',
  Cancelled: 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-900/40',
};

export const DEFAULT_STATUS_STYLE =
  'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-250 dark:border-stone-700/55';

export function getStatusStyles(status: string): string {
  return STATUS_COLORS[status] ?? DEFAULT_STATUS_STYLE;
}

