import { describe, it, expect } from 'vitest';
import { normalizeMoney, calculatePaymentState, ORDER_WORKFLOW } from '../orders.workflow.js';

describe('normalizeMoney', () => {
  it('returns null for undefined', () => {
    expect(normalizeMoney(undefined)).toBeNull();
  });

  it('returns null for null', () => {
    expect(normalizeMoney(null)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(normalizeMoney('')).toBeNull();
  });

  it('parses integer strings', () => {
    expect(normalizeMoney('5000')).toBe(5000);
  });

  it('rounds decimal values', () => {
    expect(normalizeMoney('5000.75')).toBe(5001);
  });

  it('returns null for non-numeric strings', () => {
    expect(normalizeMoney('abc')).toBeNull();
  });

  it('handles number input', () => {
    expect(normalizeMoney(11500)).toBe(11500);
  });
});

describe('calculatePaymentState', () => {
  it('returns unpaid when no finalPrice', () => {
    const result = calculatePaymentState({});
    expect(result.paymentStatus).toBe('unpaid');
    expect(result.remainingBalance).toBe(0);
  });

  it('returns paid when deposit equals finalPrice', () => {
    const result = calculatePaymentState({ finalPrice: 10000, depositAmount: 10000 });
    expect(result.paymentStatus).toBe('paid');
    expect(result.remainingBalance).toBe(0);
  });

  it('returns partial when deposit is less than finalPrice', () => {
    const result = calculatePaymentState({ finalPrice: 10000, depositAmount: 5000 });
    expect(result.paymentStatus).toBe('partial');
    expect(result.remainingBalance).toBe(5000);
  });

  it('throws when deposit exceeds finalPrice', () => {
    expect(() => calculatePaymentState({ finalPrice: 5000, depositAmount: 10000 })).toThrow();
  });

  it('handles zero values correctly', () => {
    const result = calculatePaymentState({ finalPrice: 0, depositAmount: 0 });
    expect(result.paymentStatus).toBe('unpaid');
    expect(result.remainingBalance).toBe(0);
  });
});

describe('ORDER_WORKFLOW', () => {
  it('has the correct sequence', () => {
    expect(ORDER_WORKFLOW).toEqual([
      'Received',
      'Designing',
      'Quoted',
      'Confirmed',
      'InProgress',
      'Ready',
      'Completed',
    ]);
  });
});
