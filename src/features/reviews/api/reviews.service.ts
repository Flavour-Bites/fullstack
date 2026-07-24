import { reviewsRepository } from './reviews.repository';

export const reviewsService = {
  async findAll() {
    return reviewsRepository.findAll();
  },

  async create(data: {
    rating: number;
    content: string;
    author: string;
    eventType?: string;
    role?: string;
    productId?: string | null;
  }, userId: string) {
    return reviewsRepository.create({
      ...data,
      eventType: data.eventType || 'Cake Order',
      role: data.role || 'Customer',
      userId,
    });
  },

  async delete(id: string) {
    return reviewsRepository.delete(id);
  },

  async update(id: string, data: Record<string, unknown>) {
    return reviewsRepository.update(id, data);
  },
};
