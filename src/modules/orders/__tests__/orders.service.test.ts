import { describe, it, expect, vi } from 'vitest';
import { ordersService } from '../orders.service.js';

const mockOrder = {
  id: 'FB-ABC123',
  userId: 'usr_123',
  contactName: 'Test User',
  contactPhone: '+251911111111',
  eventType: 'Birthday',
  guestCount: 30,
  deliveryOption: 'pickup',
  deliveryAddress: null,
  deliveryDate: '2026-07-15',
  designStyle: 'Simple',
  flavor: 'Vanilla',
  tierCount: 2,
  specialInstructions: '',
  referenceImage: null,
  referenceImagePublicId: null,
  referenceImageFormat: null,
  referenceImageBytes: null,
  requestDate: 'June 23, 2026',
  status: 'Received',
  quotedPrice: null,
  finalPrice: null,
  depositAmount: null,
  remainingBalance: 0,
  paymentStatus: 'unpaid',
  deletedAt: null,
  createdAt: new Date(),
  bakerNote: null,
  depositPaidAt: null,
  priceConfirmedAt: null,
  user: { id: 'usr_123', name: 'Test User', role: 'customer' },
};

const mockQuotedOrder = {
  ...mockOrder,
  id: 'FB-QUOTED',
  status: 'Quoted',
  quotedPrice: 5000,
};

vi.mock('../orders.repository.js', () => ({
  ordersRepository: {
    create: vi.fn((data) => Promise.resolve({ ...mockOrder, id: data.id })),
    findById: vi.fn((id) => {
      if (id === 'FB-ABC123') return Promise.resolve(mockOrder);
      if (id === 'FB-QUOTED') return Promise.resolve(mockQuotedOrder);
      if (id === 'FB-DELETED') return Promise.resolve({ ...mockOrder, id: 'FB-DELETED', deletedAt: new Date() });
      return Promise.resolve(null);
    }),
    findMany: vi.fn(() => Promise.resolve([mockOrder])),
    updateStatus: vi.fn((id, status, actor) =>
      Promise.resolve({ ...mockOrder, id, status }),
    ),
    updateCommercials: vi.fn((id, data) =>
      Promise.resolve({ ...mockOrder, id, ...data }),
    ),
    softDelete: vi.fn((id) => Promise.resolve({ ...mockOrder, id, deletedAt: new Date() })),
    restore: vi.fn((id) => Promise.resolve({ ...mockOrder, id, deletedAt: null })),
    updateFull: vi.fn((id, fields) => Promise.resolve({ ...mockOrder, id, ...fields })),
    findStatusEvents: vi.fn(() => Promise.resolve([])),
  },
}));

vi.mock('../../../shared/utils/ids.js', () => ({
  makeOrderId: vi.fn(() => 'FB-TEST001'),
}));

vi.mock('../orders.workflow.js', () => ({
  normalizeMoney: vi.fn((val) => {
    if (val === undefined || val === null || val === '') return null;
    const parsed = Number(val);
    if (!Number.isFinite(parsed)) return null;
    return Math.round(parsed);
  }),
  calculatePaymentState: vi.fn((input) => ({
    depositAmount: input.depositAmount ?? 0,
    remainingBalance: (input.finalPrice ?? 0) - (input.depositAmount ?? 0),
    paymentStatus: 'unpaid',
  })),
}));

vi.mock('../../../integrations/telegram/telegramNotifications.js', () => ({
  notifyStaffNewOrder: vi.fn(() => Promise.resolve()),
  notifyCustomerStatusChange: vi.fn(() => Promise.resolve()),
  notifyStaffQuoteAccepted: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../../app/config/prisma.js', () => ({
  getPrisma: vi.fn(() => ({
    customCakeRequest: {
      update: vi.fn((args) => Promise.resolve({ ...mockOrder, id: args.where.id, ...args.data })),
    },
  })),
}));

describe('ordersService.create', () => {
  it('creates an order and notifies staff', async () => {
    const data = {
      contactName: 'Test User',
      contactPhone: '+251911111111',
      eventType: 'Birthday',
      guestCount: 30,
      deliveryDate: '2026-07-15',
      flavor: 'Vanilla',
      tierCount: 2,
    };
    const order = await ordersService.create(data, 'usr_123');
    expect(order.id).toBe('FB-TEST001');
    expect(order.contactName).toBe('Test User');
  });
});

describe('ordersService.findAll', () => {
  it('returns orders', async () => {
    const result = await ordersService.findAll({});
    expect(result).toHaveLength(1);
  });
});

describe('ordersService.findById', () => {
  it('returns order by id', async () => {
    const order = await ordersService.findById('FB-ABC123');
    expect(order?.id).toBe('FB-ABC123');
  });

  it('returns null for missing order', async () => {
    const order = await ordersService.findById('FB-NOPE');
    expect(order).toBeNull();
  });
});

describe('ordersService.updateCommercials', () => {
  it('throws on invalid money value', async () => {
    await expect(ordersService.updateCommercials('FB-ABC123', { quotedPrice: 'abc' }))
      .rejects.toThrow('Please enter a valid amount');
  });

  it('returns null when no commercial fields present', async () => {
    const result = await ordersService.updateCommercials('FB-ABC123', { designStyle: 'New' });
    expect(result).toBeNull();
  });

  it('updates commercial fields', async () => {
    const result = await ordersService.updateCommercials('FB-ABC123', { quotedPrice: 5000 });
    expect(result?.id).toBe('FB-ABC123');
  });
});

describe('ordersService.changeStatus', () => {
  it('updates status and notifies customer', async () => {
    const result = await ordersService.changeStatus('FB-ABC123', 'Designing', {
      userId: 'usr_001',
      source: 'admin_api',
    });
    expect(result?.status).toBe('Designing');
  });
});

describe('ordersService.acceptPrice', () => {
  it('throws when order not found', async () => {
    await expect(ordersService.acceptPrice('FB-NOPE', 'usr_123', 'customer'))
      .rejects.toThrow('Order not found');
  });

  it('throws when order is deleted', async () => {
    await expect(ordersService.acceptPrice('FB-DELETED', 'usr_123', 'customer'))
      .rejects.toThrow('Order not found');
  });

  it('throws when customer tries to confirm another customer order', async () => {
    await expect(ordersService.acceptPrice('FB-ABC123', 'usr_OTHER', 'customer'))
      .rejects.toThrow('You can only confirm your own cake order');
  });

  it('throws when no quoted price', async () => {
    await expect(ordersService.acceptPrice('FB-ABC123', 'usr_123', 'customer'))
      .rejects.toThrow('Cake price is not ready yet');
  });

  it('accepts price and updates to Confirmed', async () => {
    const result = await ordersService.acceptPrice('FB-QUOTED', 'usr_123', 'customer');
    expect(result.status).toBe('Confirmed');
  });
});

describe('ordersService.softDelete', () => {
  it('soft deletes an order', async () => {
    const result = await ordersService.softDelete('FB-ABC123');
    expect(result.deletedAt).toBeTruthy();
  });
});

describe('ordersService.restore', () => {
  it('restores a deleted order', async () => {
    const result = await ordersService.restore('FB-DELETED');
    expect(result.deletedAt).toBeNull();
  });
});

describe('ordersService.updateAll', () => {
  it('returns the updated order', async () => {
    const result = await ordersService.updateAll('FB-ABC123', { quotedPrice: 5000 });
    expect(result).toBeDefined();
    expect(result.id).toBe('FB-ABC123');
  });
});

describe('ordersService.getTimeline', () => {
  it('returns status events', async () => {
    const events = await ordersService.getTimeline('FB-ABC123');
    expect(events).toEqual([]);
  });
});
