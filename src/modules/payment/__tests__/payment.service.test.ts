import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockOrder = {
  id: 'FB-ABC123',
  contactName: 'Test User',
  contactPhone: '+251911111111',
  finalPrice: 9000,
  quotedPrice: 9000,
  depositAmount: 0,
  remainingBalance: 9000,
  paymentStatus: 'unpaid' as const,
  status: 'Received' as const,
};

let updateData: Record<string, unknown> = {};

vi.mock('../../../app/config/prisma.js', () => ({
  getPrisma: () => ({
    customCakeRequest: {
      findUnique: vi.fn().mockResolvedValue({ ...mockOrder }),
      findFirst: vi.fn().mockImplementation(({ where }) => {
        const idPrefix = where?.id?.startsWith;
        if (idPrefix && mockOrder.id.startsWith(idPrefix)) {
          return Promise.resolve({
            ...mockOrder,
            depositAmount: mockOrder.depositAmount,
            remainingBalance: mockOrder.remainingBalance,
            paymentStatus: mockOrder.paymentStatus,
          });
        }
        return Promise.resolve(null);
      }),
      update: vi.fn().mockImplementation(({ data }) => {
        updateData = { ...data };
        if (data.depositAmount !== undefined) mockOrder.depositAmount = data.depositAmount;
        if (data.remainingBalance !== undefined) mockOrder.remainingBalance = data.remainingBalance;
        if (data.paymentStatus !== undefined) mockOrder.paymentStatus = data.paymentStatus;
        return Promise.resolve({ ...mockOrder, ...data });
      }),
    },
    orderStatusEvent: {
      create: vi.fn().mockResolvedValue({}),
    },
  }),
}));

let counter = 0;
function uniqueRef() {
  return `FB-ABC123-T${++counter}`;
}

describe('paymentService.processWebhook', () => {
  beforeEach(() => {
    updateData = {};
    mockOrder.depositAmount = 0;
    mockOrder.remainingBalance = 9000;
    mockOrder.paymentStatus = 'unpaid';
  });

  it('applies payment on successful webhook', async () => {
    const { paymentService } = await import('../payment.service.js');

    await paymentService.processWebhook({
      tx_ref: uniqueRef(),
      status: 'success',
      amount: 4500,
    });

    expect(updateData.depositAmount).toBe(4500);
    expect(updateData.remainingBalance).toBe(4500);
    expect(updateData.paymentStatus).toBe('partial');
  });

  it('does NOT double-deposit on duplicate webhook (idempotency)', async () => {
    const { paymentService } = await import('../payment.service.js');
    const txRef = uniqueRef();

    await paymentService.processWebhook({
      tx_ref: txRef,
      status: 'success',
      amount: 4500,
    });

    expect(updateData.depositAmount).toBe(4500);

    updateData = {};

    await paymentService.processWebhook({
      tx_ref: txRef,
      status: 'success',
      amount: 4500,
    });

    expect(updateData).toEqual({});
  });

  it('processes different tx_refs independently', async () => {
    const { paymentService } = await import('../payment.service.js');
    const ref1 = uniqueRef();
    const ref2 = uniqueRef();

    await paymentService.processWebhook({
      tx_ref: ref1,
      status: 'success',
      amount: 2000,
    });
    expect(updateData.depositAmount).toBe(2000);

    updateData = {};

    await paymentService.processWebhook({
      tx_ref: ref2,
      status: 'success',
      amount: 3000,
    });
    // Both webhooks processed (different tx_refs), deposit accumulates
    expect(updateData.depositAmount).toBe(5000);
    expect(updateData.paymentStatus).toBe('partial');
  });

  it('ignores non-success webhook', async () => {
    const { paymentService } = await import('../payment.service.js');

    await paymentService.processWebhook({
      tx_ref: uniqueRef(),
      status: 'pending',
      amount: 4500,
    });

    expect(updateData).toEqual({});
  });

  it('ignores webhook with missing tx_ref', async () => {
    const { paymentService } = await import('../payment.service.js');

    await paymentService.processWebhook({
      status: 'success',
      amount: 4500,
    });

    expect(updateData).toEqual({});
  });

  it('ignores webhook for non-existent order', async () => {
    const { paymentService } = await import('../payment.service.js');

    await paymentService.processWebhook({
      tx_ref: 'FB-NONEXISTENT-pay1',
      status: 'success',
      amount: 4500,
    });

    expect(updateData).toEqual({});
  });
});

describe('paymentService.processWebhook — order matching', () => {
  it('extracts order ID prefix from tx_ref correctly', () => {
    const txRef = 'FB-ABC123-payment';
    const prefix = txRef.split('-').slice(0, -1).join('-');
    expect(prefix).toBe('FB-ABC123');
  });

  it('handles tx_ref with multiple dashes in order ID', () => {
    const txRef = 'FB-ABC-123-payment';
    const prefix = txRef.split('-').slice(0, -1).join('-');
    expect(prefix).toBe('FB-ABC-123');
  });
});
