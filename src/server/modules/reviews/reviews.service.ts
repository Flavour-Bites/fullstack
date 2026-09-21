import { reviewsRepository } from './reviews.repository';
import type { CreateReviewInput, UpdateReviewInput } from './reviews.schemas';

export const reviewsService = {
  async findAll() {
    return reviewsRepository.findAll();
  },

  async create(data: CreateReviewInput, userId: string) {
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

  async update(id: string, data: UpdateReviewInput) {
    return reviewsRepository.update(id, data);
  },
};
