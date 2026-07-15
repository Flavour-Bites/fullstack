// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { nextStatus, orderPrice, WORKFLOW } from './types';
import type { CakeRequest } from './types';

describe('WORKFLOW', () => {
  it('defines the standard order workflow stages', () => {
    expect(WORKFLOW).toEqual([
      'Received', 'Designing', 'Quoted', 'Confirmed',
      'In Progress', 'Ready', 'Completed',
    ]);
  });
});

describe('nextStatus', () => {
  it('returns the next status in the workflow', () => {
    expect(nextStatus('Received')).toBe('Designing');
    expect(nextStatus('Designing')).toBe('Quoted');
    expect(nextStatus('Quoted')).toBe('Confirmed');
    expect(nextStatus('Confirmed')).toBe('In Progress');
    expect(nextStatus('In Progress')).toBe('Ready');
    expect(nextStatus('Ready')).toBe('Completed');
  });

  it('returns null for the last status', () => {
    expect(nextStatus('Completed')).toBeNull();
  });

  it('returns null for an unknown status', () => {
    expect(nextStatus('Unknown')).toBeNull();
  });
});

describe('orderPrice', () => {
  const base: CakeRequest = {
    id: '1', contactName: '', contactPhone: '', eventType: '',
    guestCount: 0, deliveryOption: '', deliveryAddress: null,
    deliveryDate: '', designStyle: '', flavor: '', tierCount: 0,
    specialInstructions: null, requestDate: '', status: '',
    referenceImage: null, depositAmount: 0, remainingBalance: 0,
    paymentStatus: '', createdAt: '',
  };

  it('returns finalPrice when available', () => {
    expect(orderPrice({ ...base, finalPrice: 5000, quotedPrice: 3000 })).toBe(5000);
  });

  it('falls back to quotedPrice when no finalPrice', () => {
    expect(orderPrice({ ...base, quotedPrice: 3000 })).toBe(3000);
  });

  it('returns 0 when neither price is set', () => {
    expect(orderPrice(base)).toBe(0);
  });
});
