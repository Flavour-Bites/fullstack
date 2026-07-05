import { describe, it, expect, vi } from 'vitest';

const mockRequestsFindMany = vi.fn();
const mockUsersFindMany = vi.fn();
const mockReviewsFindMany = vi.fn();

vi.mock('../../../app/config/prisma.js', () => ({
  getPrisma: vi.fn(() => ({
    customCakeRequest: { findMany: mockRequestsFindMany },
    user: { findMany: mockUsersFindMany },
    review: { findMany: mockReviewsFindMany },
  })),
}));

describe('statsService.getStats', () => {
  it('returns computed stats', async () => {
    mockRequestsFindMany.mockResolvedValue([
      { status: 'Completed', finalPrice: 10000, paymentStatus: 'paid', deletedAt: null, createdAt: new Date() },
      { status: 'Received', finalPrice: null, paymentStatus: 'unpaid', deletedAt: null, createdAt: new Date() },
      { status: 'Confirmed', finalPrice: 5000, paymentStatus: 'partial', deletedAt: null, createdAt: new Date() },
      { status: 'Completed', finalPrice: null, paymentStatus: 'unpaid', deletedAt: new Date(), createdAt: new Date() },
    ]);
    mockUsersFindMany.mockResolvedValue([
      { role: 'admin' },
      { role: 'staff' },
      { role: 'customer' },
      { role: 'customer' },
    ]);
    mockReviewsFindMany.mockResolvedValue([
      { rating: 5 },
      { rating: 4 },
      { rating: 3 },
    ]);

    const { statsService } = await import('../stats.service.js');
    const stats = await statsService.getStats();

    expect(stats.totalOrders).toBe(3);
    expect(stats.totalRevenue).toBe(15000);
    expect(stats.avgOrderValue).toBe(5000);
    expect(stats.paidOrders).toBe(1);
    expect(stats.avgRating).toBe('4.0');
    expect(stats.totalUsers).toBe(4);
    expect(stats.totalReviews).toBe(3);
    expect(stats.roleCounts).toEqual({ customer: 2, staff: 1, admin: 1 });
    expect(stats.statusBreakdown).toEqual({ Completed: 1, Received: 1, Confirmed: 1 });
  });

  it('handles empty data', async () => {
    mockRequestsFindMany.mockResolvedValue([]);
    mockUsersFindMany.mockResolvedValue([]);
    mockReviewsFindMany.mockResolvedValue([]);

    const { statsService } = await import('../stats.service.js');
    const emptyStats = await statsService.getStats();

    expect(emptyStats.totalOrders).toBe(0);
    expect(emptyStats.totalRevenue).toBe(0);
    expect(emptyStats.avgOrderValue).toBe(0);
    expect(emptyStats.avgRating).toBe('0');
    expect(emptyStats.totalUsers).toBe(0);
    expect(emptyStats.totalReviews).toBe(0);
  });
});
