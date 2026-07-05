import { getPrisma } from '../../app/config/prisma.js';
import { makeId } from '../../shared/utils/ids.js';

export const reviewsRepository = {
  async findAll() {
    const prisma = getPrisma();
    return prisma.review.findMany({ orderBy: { createdAt: 'desc' } });
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
        eventType: data.eventType || 'Cake Order',
        role: data.role || 'Customer',
        userId: data.userId,
        productId: data.productId ?? null,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      },
    });
  },

  async delete(id: string) {
    const prisma = getPrisma();
    return prisma.review.delete({ where: { id } });
  },
};
