import type { OrderStatus, PaymentStatus } from '@prisma/client';

export type AnalyticsOrder = {
  status: OrderStatus | string;
  finalPrice: number | null;
  paymentStatus: PaymentStatus | string;
  deletedAt?: Date | string | null;
  createdAt: Date | string;
};

export function calculateAnalytics(orders: AnalyticsOrder[], now = new Date()) {
  const activeOrders = orders.filter((order) => !order.deletedAt);
  const completedOrders = activeOrders.filter((order) => order.status === 'Completed');
  const revenueOrders = activeOrders.filter((order) => typeof order.finalPrice === 'number');
  const totalRevenue = revenueOrders.reduce((sum, order) => sum + (order.finalPrice ?? 0), 0);

  const month = now.getUTCMonth();
  const year = now.getUTCFullYear();
  const monthlyRevenue = revenueOrders.reduce((sum, order) => {
    const created = new Date(order.createdAt);
    if (created.getUTCMonth() === month && created.getUTCFullYear() === year) {
      return sum + (order.finalPrice ?? 0);
    }
    return sum;
  }, 0);

  const paidCount = activeOrders.filter((order) => order.paymentStatus === 'paid').length;

  return {
    totalRevenue,
    monthlyRevenue,
    activeOrders: activeOrders.filter((order) => !['Completed', 'Cancelled'].includes(String(order.status))).length,
    completedOrders: completedOrders.length,
    averageOrderValue: revenueOrders.length ? Math.round(totalRevenue / revenueOrders.length) : 0,
    paymentCompletionRate: activeOrders.length ? Number((paidCount / activeOrders.length).toFixed(4)) : 0,
  };
}
