// src/components/admin/types.ts
import React from 'react';
import {
  Coins, Check, Edit3, CheckCircle2, Inbox, Package, Truck
} from 'lucide-react';

export interface CakeRequest {
  id: string;
  contactName: string;
  contactPhone: string;
  eventType: string;
  guestCount: number;
  deliveryOption: string;
  deliveryAddress: string | null;
  deliveryDate: string;
  designStyle: string;
  flavor: string;
  tierCount: number;
  specialInstructions: string | null;
  requestDate: string;
  status: string;
  referenceImage: string | null;
  userId?: string;
  quotedPrice?: number;
  finalPrice?: number;
  depositAmount: number;
  remainingBalance: number;
  paymentStatus: string;
  bakerNote?: string | null;
  createdAt: string;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Stats {
  totalOrders: number;
  totalRevenue: number;
  avgRating: string;
  statusBreakdown: Record<string, number>;
  roleCounts: Record<string, number>;
  totalUsers: number;
  totalReviews: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewItem {
  id: string;
  rating: number;
  content: string;
  author: string;
  eventType: string;
  role: string;
  userId: string | null;
  productId: string | null;
  date: string;
  createdAt: string;
}

export const STATUS_COLORS: Record<string, string> = {
  Completed: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400',
  Ready: 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400',
  'In Progress': 'bg-blue-100 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-400',
  Designing: 'bg-purple-100 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-400',
  Confirmed: 'bg-sky-100 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-400',
  Quoted: 'bg-orange-100 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-400',
  Received: 'bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400',
  Pending: 'bg-amber-100 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400',
};

export const STATUS_ICONS: Record<string, React.ReactNode> = {
  Received: React.createElement(Inbox, { className: 'w-3 h-3' }),
  Pending: React.createElement(Inbox, { className: 'w-3 h-3' }),
  Designing: React.createElement(Edit3, { className: 'w-3 h-3' }),
  Quoted: React.createElement(Coins, { className: 'w-3 h-3' }),
  Confirmed: React.createElement(CheckCircle2, { className: 'w-3 h-3' }),
  'In Progress': React.createElement(Package, { className: 'w-3 h-3' }),
  Ready: React.createElement(Truck, { className: 'w-3 h-3' }),
  Completed: React.createElement(Check, { className: 'w-3 h-3' }),
};

export const WORKFLOW: string[] = ['Received', 'Designing', 'Quoted', 'Confirmed', 'In Progress', 'Ready', 'Completed'];

export function nextStatus(current: string): string | null {
  const idx = WORKFLOW.indexOf(current);
  return idx >= 0 && idx < WORKFLOW.length - 1 ? WORKFLOW[idx + 1] : null;
}

export function orderPrice(r: CakeRequest): number {
  return r.finalPrice ?? r.quotedPrice ?? 0;
}

export function exportOrdersCSV(requests: CakeRequest[]) {
  const headers = ['ID', 'Customer', 'Phone', 'Event', 'Guests', 'Delivery Date', 'Flavor', 'Tiers', 'Status', 'Price (ETB)', 'Submitted'];
  const rows = requests.map(r => [
    r.id, r.contactName, r.contactPhone, r.eventType,
    r.guestCount, r.deliveryDate, r.flavor, r.tierCount, r.status,
    orderPrice(r), r.requestDate
  ]);
  const csv = [headers, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flavour-bites-orders-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
