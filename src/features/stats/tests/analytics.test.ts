import { describe, it, expect } from 'vitest';
import { calculateAnalytics } from '@/shared/utils/analytics.js';

describe('calculateAnalytics', () => {
  const baseDate = new Date('2026-06-15');

  it('returns zeros for empty orders', () => {
    const result = calculateAnalytics([], baseDate);
    expect(result.totalRevenue).toBe(0);
    expect(result.activeOrders).toBe(0);
    expect(result.completedOrders).toBe(0);
    expect(result.averageOrderValue).toBe(0);
    expect(result.paymentCompletionRate).toBe(0);
  });

  it('calculates total revenue from finalPrice', () => {
    const orders = [
      { status: 'Completed', finalPrice: 10000, paymentStatus: 'paid', createdAt: new Date('2026-06-01') },
      { status: 'Completed', finalPrice: 5000, paymentStatus: 'paid', createdAt: new Date('2026-06-10') },
    ];
    const result = calculateAnalytics(orders, baseDate);
    expect(result.totalRevenue).toBe(15000);
  });

  it('excludes deleted orders', () => {
    const orders = [
      { status: 'Completed', finalPrice: 10000, paymentStatus: 'paid', createdAt: new Date('2026-06-01'), deletedAt: new Date() },
      { status: 'Completed', finalPrice: 5000, paymentStatus: 'paid', createdAt: new Date('2026-06-10') },
    ];
    const result = calculateAnalytics(orders, baseDate);
    expect(result.totalRevenue).toBe(5000);
  });

  it('counts active orders (non-completed, non-cancelled)', () => {
    const orders = [
      { status: 'Received', finalPrice: null, paymentStatus: 'unpaid', createdAt: new Date('2026-06-01') },
      { status: 'Designing', finalPrice: null, paymentStatus: 'unpaid', createdAt: new Date('2026-06-05') },
      { status: 'Completed', finalPrice: 10000, paymentStatus: 'paid', createdAt: new Date('2026-06-10') },
      { status: 'Cancelled', finalPrice: null, paymentStatus: 'unpaid', createdAt: new Date('2026-06-15') },
    ];
    const result = calculateAnalytics(orders, baseDate);
    expect(result.activeOrders).toBe(2);
    expect(result.completedOrders).toBe(1);
  });

  it('calculates monthly revenue correctly', () => {
    const orders = [
      { status: 'Completed', finalPrice: 10000, paymentStatus: 'paid', createdAt: new Date('2026-06-01') },
      { status: 'Completed', finalPrice: 5000, paymentStatus: 'paid', createdAt: new Date('2026-05-15') },
    ];
    const result = calculateAnalytics(orders, baseDate);
    expect(result.monthlyRevenue).toBe(10000);
  });

  it('calculates average order value', () => {
    const orders = [
      { status: 'Completed', finalPrice: 10000, paymentStatus: 'paid', createdAt: new Date('2026-06-01') },
      { status: 'Completed', finalPrice: 20000, paymentStatus: 'paid', createdAt: new Date('2026-06-10') },
    ];
    const result = calculateAnalytics(orders, baseDate);
    expect(result.averageOrderValue).toBe(15000);
  });

  it('calculates payment completion rate', () => {
    const orders = [
      { status: 'Completed', finalPrice: 10000, paymentStatus: 'paid', createdAt: new Date('2026-06-01') },
      { status: 'Completed', finalPrice: 5000, paymentStatus: 'unpaid', createdAt: new Date('2026-06-10') },
      { status: 'Received', finalPrice: null, paymentStatus: 'unpaid', createdAt: new Date('2026-06-15') },
    ];
    const result = calculateAnalytics(orders, baseDate);
    expect(result.paymentCompletionRate).toBeCloseTo(0.3333, 3);
  });
});
