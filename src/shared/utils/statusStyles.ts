const STATUS_STYLES: Record<string, string> = {
  Received: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-900/30',
  Pending: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-900/30',
  Designing: 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-900/30',
  Quoted: 'bg-purple-100 dark:bg-purple-955/40 text-purple-800 dark:text-purple-300 border border-purple-250 dark:border-purple-900/30',
  Confirmed: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-900/30',
  InProgress: 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-900/30',
  Ready: 'bg-green-100 dark:bg-green-950/40 text-green-850 dark:text-green-300 border border-green-200 dark:border-green-900/30',
  Completed: 'bg-green-100 dark:bg-green-950/40 text-green-850 dark:text-green-300 border border-green-200 dark:border-green-900/30',
  Cancelled: 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900/30',
};

const DEFAULT_STATUS_STYLE = 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-250 dark:border-stone-700/55';

export function getStatusStyles(status: string): string {
  return STATUS_STYLES[status] ?? DEFAULT_STATUS_STYLE;
}
