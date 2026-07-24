import { describe, it, expect, vi } from 'vitest';

const mockOrderAggregate = vi.fn();
const mockOrderCount = vi.fn();
const mockUserGroupBy = vi.fn();
const mockUserCount = vi.fn();
const mockReviewAggregate = vi.fn();
const mockOrderGroupBy = vi.fn();

vi.mock('@/app/config/prisma.js', () => ({
  getPrisma: vi.fn(() => ({
    customCakeRequest: {
      aggregate: mockOrderAggregate,
      count: mockOrderCount,
      groupBy: mockOrderGroupBy,
    },
    user: {
      groupBy: mockUserGroupBy,
      count: mockUserCount,
    },
    review: {
      aggregate: mockReviewAggregate,
    },
  })),
}));

describe('statsService.getStats', () => {
  it('returns computed stats', async () => {
    mockOrderAggregate.mockResolvedValue({
      _count: 3,
      _sum: { finalPrice: 15000 },
      _avg: { finalPrice: 5000 },
    });
    mockOrderCount.mockResolvedValue(1);
    mockUserGroupBy.mockResolvedValue([
      { role: 'admin', _count: 1 },
      { role: 'staff', _count: 1 },
      { role: 'customer', _count: 2 },
    ]);
    mockUserCount.mockResolvedValue(4);
    mockReviewAggregate.mockResolvedValue({
      _count: 3,
      _avg: { rating: 4.0 },
    });
    mockOrderGroupBy.mockResolvedValue([
      { status: 'Completed', _count: 1 },
      { status: 'Received', _count: 1 },
      { status: 'Confirmed', _count: 1 },
    ]);

    const { statsService } = await import('@/features/stats/api/stats.service.js');
    const stats = await statsService.getStats();

    expect(stats.totalOrders).toBe(3);
    expect(stats.totalRevenue).toBe(15000);
    expect(stats.avgOrderValue).toBe(5000);
    expect(stats.avgRating).toBe('4.0');
    expect(stats.totalUsers).toBe(4);
    expect(stats.totalReviews).toBe(3);
    expect(stats.roleCounts).toEqual({ customer: 2, staff: 1, admin: 1 });
    expect(stats.statusBreakdown).toEqual({ Completed: 1, Received: 1, Confirmed: 1 });
  });

  it('handles empty data', async () => {
    mockOrderAggregate.mockResolvedValue({
      _count: 0,
      _sum: { finalPrice: null },
      _avg: { finalPrice: null },
    });
    mockOrderCount.mockResolvedValue(0);
    mockUserGroupBy.mockResolvedValue([]);
    mockUserCount.mockResolvedValue(0);
    mockReviewAggregate.mockResolvedValue({
      _count: 0,
      _avg: { rating: null },
    });
    mockOrderGroupBy.mockResolvedValue([]);

    const { statsService } = await import('@/features/stats/api/stats.service.js');
    const emptyStats = await statsService.getStats();

    expect(emptyStats.totalOrders).toBe(0);
    expect(emptyStats.totalRevenue).toBe(0);
    expect(emptyStats.avgOrderValue).toBe(0);
    expect(emptyStats.avgRating).toBe('0');
    expect(emptyStats.totalUsers).toBe(0);
    expect(emptyStats.totalReviews).toBe(0);
  });
});
