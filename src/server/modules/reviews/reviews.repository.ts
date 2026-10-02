import { getPrisma } from '../../platform/config/prisma';
import { makeId } from '../../../shared/utils/ids';
import { formatRequestDate } from '../../../shared/utils/dateFormat';

export const reviewsRepository = {
  async findAll(productId?: string) {
    const prisma = getPrisma();
    return prisma.review.findMany({
      where: productId ? { productId } : { productId: null },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            telegramPhoto: true,
          },
        },
      },
    });
  },

  async create(data: {
    rating: number;
    content: string;
    author: string;
    eventType: string;
    role: string;
    userId: string;
    productId?: string | null;
  }) {
    const prisma = getPrisma();
    return prisma.review.create({
      data: {
        id: makeId('rev'),
        rating: data.rating,
        content: data.content,
        author: data.author,
        eventType: data.eventType || 'Bakery Order',
        role: data.role || 'Customer',
        userId: data.userId,
        productId: data.productId ?? null,
        date: formatRequestDate(),
      },
    });
  },

  async delete(id: string) {
    const prisma = getPrisma();
    return prisma.review.delete({ where: { id } });
  },
};
