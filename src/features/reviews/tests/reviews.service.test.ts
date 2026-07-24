import { describe, it, expect, vi } from 'vitest';
import { reviewsService } from '@/features/reviews/api/reviews.service.js';

const mockReviews = [
  { id: 'rev_001', rating: 5, content: 'Great cake!', author: 'Alice', eventType: 'Birthday', role: 'Customer', productId: null, userId: 'usr_001', date: 'June 23, 2026' },
  { id: 'rev_002', rating: 4, content: 'Very good', author: 'Bob', eventType: 'Wedding', role: 'Customer', productId: null, userId: 'usr_002', date: 'June 22, 2026' },
];

vi.mock('@/features/reviews/api/reviews.repository.js', () => ({
  reviewsRepository: {
    findAll: vi.fn(() => Promise.resolve(mockReviews)),
    create: vi.fn((data) => Promise.resolve({ ...data, id: 'rev_new', date: 'June 23, 2026' })),
    delete: vi.fn((id) => Promise.resolve({ id })),
  },
}));

describe('reviewsService.findAll', () => {
  it('returns all reviews', async () => {
    const reviews = await reviewsService.findAll();
    expect(reviews).toHaveLength(2);
  });
});

describe('reviewsService.create', () => {
  it('creates a review with default eventType and role', async () => {
    const review = await reviewsService.create(
      { rating: 5, content: 'Amazing!', author: 'Charlie' },
      'usr_003',
    );
    expect(review.author).toBe('Charlie');
    expect(review.eventType).toBe('Cake Order');
    expect(review.role).toBe('Customer');
  });

  it('creates a review with custom values', async () => {
    const review = await reviewsService.create(
      { rating: 3, content: 'OK', author: 'Diana', eventType: 'Custom', role: 'Event Planner', productId: 'gal_001' },
      'usr_004',
    );
    expect(review.eventType).toBe('Custom');
    expect(review.role).toBe('Event Planner');
    expect(review.productId).toBe('gal_001');
  });
});

describe('reviewsService.delete', () => {
  it('deletes a review', async () => {
    await expect(reviewsService.delete('rev_001')).resolves.not.toThrow();
  });
});
