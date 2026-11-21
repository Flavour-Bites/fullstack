import { getPrisma } from '../../platform/config/prisma';

export const statsRepository = {
  async getRawMetrics() {
    const prisma = getPrisma();
    return Promise.all([
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
  },
};

