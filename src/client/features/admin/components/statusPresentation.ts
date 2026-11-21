import React from 'react';
import {
  Coins, Check, Edit3, CheckCircle2, Inbox, Package, Truck
} from 'lucide-react';

export const STATUS_COLORS: Record<string, string> = {
  Completed: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400',
  Ready: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400',
  InProgress: 'bg-blue-100 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-400',
  Designing: 'bg-purple-100 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-400',
  Confirmed: 'bg-sky-100 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-400',
  Priced: 'bg-orange-100 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-400',
  Received: 'bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400',
  Pending: 'bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400',
};

export const STATUS_ICONS: Record<string, React.ReactNode> = {
  Received: React.createElement(Inbox, { className: 'w-3 h-3' }),
  Pending: React.createElement(Inbox, { className: 'w-3 h-3' }),
  Designing: React.createElement(Edit3, { className: 'w-3 h-3' }),
  Priced: React.createElement(Coins, { className: 'w-3 h-3' }),
  Confirmed: React.createElement(CheckCircle2, { className: 'w-3 h-3' }),
  InProgress: React.createElement(Package, { className: 'w-3 h-3' }),
  Ready: React.createElement(Truck, { className: 'w-3 h-3' }),
  Completed: React.createElement(Check, { className: 'w-3 h-3' }),
};