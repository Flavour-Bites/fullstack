export type AdminTab = 'dashboard' | 'orders' | 'menu' | 'categories' | 'reviews' | 'users' | 'recovery';

export interface CakeRequest {
  id: string;
  contactName: string;
  contactPhone: string;
  eventType: string;
  guestCount: number;
  eventDate: string;
  designStyle: string;
  flavor: string;
  tierCount: number;
  specialInstructions: string | null;
  requestDate: string;
  status: string;
  referenceImage: string | null;
  price?: number;
  finalPrice?: number;
  depositAmount: number;
  remainingBalance: number;
  paymentStatus: string;
  bakerNote?: string | null;
  userId?: string;
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

export const WORKFLOW: string[] = ['Received', 'Designing', 'Priced', 'Confirmed', 'InProgress', 'Ready', 'Completed'];

export function nextStatus(current: string): string | null {
  const idx = WORKFLOW.indexOf(current);
  return idx >= 0 && idx < WORKFLOW.length - 1 ? WORKFLOW[idx + 1] : null;
}

export function orderPrice(r: CakeRequest): number {
  return r.finalPrice ?? r.price ?? 0;
}