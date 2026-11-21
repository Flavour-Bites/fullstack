import { reviewsRepository } from './reviews.repository';
import type { CreateReviewInput } from './reviews.schemas';
import { formatRequestDate } from '../../../shared/utils/dateFormat';
import { DEFAULT_REVIEW_EVENT_TYPE, DEFAULT_REVIEW_ROLE } from '../../../shared/constants';

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
      eventType: data.eventType || DEFAULT_REVIEW_EVENT_TYPE,
      role: data.role || DEFAULT_REVIEW_ROLE,
      userId,
      date: formatRequestDate(),
    });
  },

  async delete(id: string) {
    return reviewsRepository.delete(id);
  },
};
