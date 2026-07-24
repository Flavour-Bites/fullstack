import { describe, it, expect } from 'vitest';
import { normalizeMoney, ORDER_WORKFLOW } from '@/features/orders/api/orders.workflow.js';

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
