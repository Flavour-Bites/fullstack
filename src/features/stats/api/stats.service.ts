import { getPrisma } from '../../../app/config/prisma';

export const statsService = {
  async getStats() {
    const prisma = getPrisma();

    const [orderStats, userRoles, reviewStats, statusCounts, totalUsers] = await Promise.all([
      prisma.customCakeRequest.aggregate({
        where: { deletedAt: null },
        _count: true,
        _sum: { finalPrice: true },
        _avg: { finalPrice: true },
      }),
      prisma.user.groupBy({
        by: ['role'],
        where: { deletedAt: null },
        _count: true,
      }),
      prisma.review.aggregate({
        _count: true,
        _avg: { rating: true },
      }),
      prisma.customCakeRequest.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: true,
      }),
      prisma.user.count({ where: { deletedAt: null } }),
    ]);

    const roleCounts = { customer: 0, staff: 0, admin: 0 };
    for (const r of userRoles) {
      roleCounts[r.role as keyof typeof roleCounts] = r._count;
    }

    const statusBreakdown: Record<string, number> = {};
    for (const s of statusCounts) {
      statusBreakdown[s.status] = s._count;
    }

    return {
      totalRevenue: orderStats._sum.finalPrice ?? 0,
      avgOrderValue: orderStats._avg.finalPrice
        ? Math.round(orderStats._avg.finalPrice)
        : 0,
      totalOrders: orderStats._count,
      avgRating: reviewStats._avg.rating
        ? reviewStats._avg.rating.toFixed(1)
        : '0',
      statusBreakdown,
      roleCounts,
      totalUsers,
      totalReviews: reviewStats._count,
    };
  },
};
