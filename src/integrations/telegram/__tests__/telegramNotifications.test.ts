import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../telegramClient.js', () => ({
  sendMessage: vi.fn().mockResolvedValue(true),
  editMessage: vi.fn().mockResolvedValue(true),
  answerCallback: vi.fn().mockResolvedValue(true),
}));

const mockPrisma = {
  customCakeRequest: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  user: {
    findMany: vi.fn(),
  },
};

vi.mock('../../../app/config/prisma.js', () => ({
  getPrisma: vi.fn(() => mockPrisma),
}));

import { notifyStaffNewOrder, notifyCustomerStatusChange, notifyStaffQuoteAccepted } from '../telegramNotifications.js';
import { sendMessage } from '../telegramClient.js';

describe('notifyStaffNewOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.user.findMany.mockResolvedValue([{ telegramId: '-100_staff_chat' }]);
  });

  it('sends notification for a new order', async () => {
    const order = {
      id: 'FB-ABC123',
      contactName: 'Test User',
      contactPhone: '+251911111111',
      eventType: 'Birthday',
      deliveryDate: '2026-07-15',
      guestCount: 30,
      tierCount: 2,
      flavor: 'Vanilla',
      designStyle: 'Elegant gold trim',
      deliveryOption: 'pickup',
      deliveryAddress: null,
      quotedPrice: null,
      finalPrice: null,
      specialInstructions: 'No nuts',
      user: { telegramUsername: 'testuser' },
    };

    await notifyStaffNewOrder(order as any);
    expect(sendMessage).toHaveBeenCalledTimes(1);
    const [chatId, text, buttons] = (sendMessage as any).mock.calls[0];
    expect(chatId).toBe('-100_staff_chat');
    expect(text).toContain('New Cake Request');
    expect(text).toContain('FB-ABC123');
    expect(text).toContain('Test User');
    expect(text).toContain('@testuser');
    expect(text).toContain('Pickup');
    expect(buttons).toHaveLength(3);
  });

  it('includes delivery address for delivery orders', async () => {
    const order = {
      id: 'FB-DELIVERY',
      contactName: 'Delivery Client',
      contactPhone: '+251922222222',
      eventType: 'Wedding',
      deliveryDate: '2026-08-01',
      guestCount: 100,
      tierCount: 3,
      flavor: 'Chocolate',
      designStyle: 'Modern',
      deliveryOption: 'delivery',
      deliveryAddress: 'Bole, Addis Ababa',
      quotedPrice: null,
      finalPrice: null,
      specialInstructions: null,
      user: null,
    };

    await notifyStaffNewOrder(order as any);
    const text = (sendMessage as any).mock.calls[0][1];
    expect(text).toContain('Delivery to');
    expect(text).toContain('Bole, Addis Ababa');
  });
});

describe('notifyCustomerStatusChange', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does nothing when order is not found', async () => {
    mockPrisma.customCakeRequest.findUnique.mockResolvedValue(null);
    await notifyCustomerStatusChange('FB-NONEXISTENT');
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('does nothing when lastNotifiedStatus matches', async () => {
    mockPrisma.customCakeRequest.findUnique.mockResolvedValue({
      id: 'FB-123',
      status: 'Designing',
      lastNotifiedStatus: 'Designing',
      user: { telegramId: '12345', notifyViaTelegram: true },
    });
    await notifyCustomerStatusChange('FB-123');
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('does nothing when user has no telegramId', async () => {
    mockPrisma.customCakeRequest.findUnique.mockResolvedValue({
      id: 'FB-123',
      status: 'Quoted',
      lastNotifiedStatus: 'Designing',
      user: { telegramId: null, notifyViaTelegram: true },
    });
    await notifyCustomerStatusChange('FB-123');
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('does nothing when notifyViaTelegram is false', async () => {
    mockPrisma.customCakeRequest.findUnique.mockResolvedValue({
      id: 'FB-123',
      status: 'Quoted',
      lastNotifiedStatus: 'Designing',
      user: { telegramId: '12345', notifyViaTelegram: false },
    });
    await notifyCustomerStatusChange('FB-123');
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('sends Designing notification with correct message', async () => {
    mockPrisma.customCakeRequest.findUnique.mockResolvedValue({
      id: 'FB-123',
      contactName: 'Test',
      eventType: 'Birthday',
      deliveryDate: '2026-07-15',
      status: 'Designing',
      lastNotifiedStatus: 'Received',
      user: { telegramId: '12345', notifyViaTelegram: true },
    });
    mockPrisma.customCakeRequest.update.mockResolvedValue({});

    await notifyCustomerStatusChange('FB-123');
    const [chatId, text] = (sendMessage as any).mock.calls[0];
    expect(chatId).toBe('12345');
    expect(text).toContain('being designed');
    expect(text).toContain('Birthday');
    expect(mockPrisma.customCakeRequest.update).toHaveBeenCalledWith({
      where: { id: 'FB-123' },
      data: { lastNotifiedStatus: 'Designing' },
    });
  });

  it('sends Quoted notification with confirm/revision buttons', async () => {
    mockPrisma.customCakeRequest.findUnique.mockResolvedValue({
      id: 'FB-123',
      contactName: 'Test',
      eventType: 'Wedding',
      deliveryDate: '2026-08-15',
      status: 'Quoted',
      quotedPrice: 15000,
      finalPrice: null,
      lastNotifiedStatus: 'Designing',
      user: { telegramId: '12345', notifyViaTelegram: true },
    });
    mockPrisma.customCakeRequest.update.mockResolvedValue({});

    await notifyCustomerStatusChange('FB-123');
    const [, , buttons] = (sendMessage as any).mock.calls[0];
    expect(buttons).toBeDefined();
    expect(buttons[0][0].callback_data).toContain('confirm:');
    expect(buttons[0][1].callback_data).toContain('revise:');
  });

  it('sends Ready notification with delivery info', async () => {
    mockPrisma.customCakeRequest.findUnique.mockResolvedValue({
      id: 'FB-123',
      contactName: 'Test',
      eventType: 'Birthday',
      deliveryDate: '2026-07-15',
      status: 'Ready',
      deliveryOption: 'pickup',
      lastNotifiedStatus: 'InProgress',
      user: { telegramId: '12345', notifyViaTelegram: true },
    });
    mockPrisma.customCakeRequest.update.mockResolvedValue({});

    await notifyCustomerStatusChange('FB-123');
    const text = (sendMessage as any).mock.calls[0][1];
    expect(text).toContain('READY');
    expect(text).toContain('pick it up');
    expect(text).toContain('Bole');
  });

  it('sends Cancelled notification', async () => {
    mockPrisma.customCakeRequest.findUnique.mockResolvedValue({
      id: 'FB-123',
      status: 'Cancelled',
      lastNotifiedStatus: 'Quoted',
      user: { telegramId: '12345', notifyViaTelegram: true },
    });
    mockPrisma.customCakeRequest.update.mockResolvedValue({});

    await notifyCustomerStatusChange('FB-123');
    const text = (sendMessage as any).mock.calls[0][1];
    expect(text).toContain('Cancelled');
  });

  it('sends fallback message for unknown status', async () => {
    mockPrisma.customCakeRequest.findUnique.mockResolvedValue({
      id: 'FB-123',
      status: 'UnknownStatus',
      lastNotifiedStatus: 'Received',
      user: { telegramId: '12345', notifyViaTelegram: true },
    });
    mockPrisma.customCakeRequest.update.mockResolvedValue({});

    await notifyCustomerStatusChange('FB-123');
    const text = (sendMessage as any).mock.calls[0][1];
    expect(text).toContain('FB-123');
  });
});

describe('notifyStaffQuoteAccepted', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.user.findMany.mockResolvedValue([{ telegramId: '-100_staff_chat' }]);
  });

  it('notifies staff when a quote is accepted', async () => {
    const order = {
      id: 'FB-456',
      contactName: 'Happy Client',
      eventType: 'Anniversary',
      deliveryDate: '2026-09-01',
      quotedPrice: 25000,
      finalPrice: null,
      user: null,
    };

    await notifyStaffQuoteAccepted(order as any);
    const [chatId, text, buttons] = (sendMessage as any).mock.calls[0];
    expect(chatId).toBe('-100_staff_chat');
    expect(text).toContain('Quote Accepted');
    expect(text).toContain('Happy Client');
    expect(text).toContain('25,000 ETB');
    expect(buttons[0][0].callback_data).toContain('InProgress');
  });
});
