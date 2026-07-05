import { getPrisma } from '../../app/config/prisma.js';

function calculateAnalytics(orders: Array<{
  status: string;
  finalPrice: number | null;
  paymentStatus: string;
  deletedAt: Date | null;
  createdAt: Date;
}>) {
  const active = orders.filter((o) => !o.deletedAt);
  const totalRevenue = active.reduce((sum, o) => sum + (o.finalPrice ?? 0), 0);
  const paidOrders = active.filter((o) => o.paymentStatus === 'paid').length;
  const avgOrderValue = active.length ? Math.round(totalRevenue / active.length) : 0;

  return {
    totalRevenue,
    paidOrders,
    avgOrderValue,
  };
}

export const statsService = {
  async getStats() {
    const prisma = getPrisma();

    const [orders, users, reviews] = await Promise.all([
      prisma.customCakeRequest.findMany({
        select: { status: true, finalPrice: true, paymentStatus: true, deletedAt: true, createdAt: true },
      }),
      prisma.user.findMany({ select: { role: true } }),
      prisma.review.findMany({ select: { rating: true } }),
    ]);

    const analytics = calculateAnalytics(orders);
    const avgRating = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0';

    const roleCounts = users.reduce<Record<string, number>>((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, { customer: 0, staff: 0, admin: 0 });

    const statusBreakdown = orders
      .filter((o) => !o.deletedAt)
      .reduce<Record<string, number>>((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

    return {
      ...analytics,
      totalOrders: orders.filter((o) => !o.deletedAt).length,
      avgRating,
      statusBreakdown,
      roleCounts,
      totalUsers: users.length,
      totalReviews: reviews.length,
    };
  },
};
