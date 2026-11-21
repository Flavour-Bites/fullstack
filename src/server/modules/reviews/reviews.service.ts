import { reviewsRepository } from './reviews.repository';
import type { CreateReviewInput } from './reviews.schemas';

export const reviewsService = {
  async findAll() {
    return reviewsRepository.findAll();
  },

  async findByProductId(productId: string) {
    return reviewsRepository.findAll(productId);
  },

  async create(data: CreateReviewInput, userId: string) {
    return reviewsRepository.create({
      ...data,
      eventType: data.eventType || 'Bakery Order',
      role: data.role || 'Customer',
      userId,
    });
  },

  async delete(id: string) {
    return reviewsRepository.delete(id);
  },
};
