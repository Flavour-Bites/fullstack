import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetPrice, mockClearPrice } = vi.hoisted(() => ({
  mockGetPrice: vi.fn(),
  mockClearPrice: vi.fn(),
}));

vi.mock('@server/platform/integrations/redis/conversationState', () => ({
  getConversationStore: () => ({
    getPrice: mockGetPrice,
    clearPrice: mockClearPrice,
  }),
}));

vi.mock('@server/modules/orders/orders.service', () => ({
  ordersService: {
    update: vi.fn(),
  },
}));

vi.mock('@server/modules/users/users.service', () => ({
  usersService: {
    findByTelegramId: vi.fn(),
  },
}));

vi.mock('@server/platform/integrations/telegram/telegramNotifications', () => ({
  notifyCustomerStatusChange: vi.fn(() => Promise.resolve()),
}));

import { handlePriceInput } from '@server/bot/conversations/priceConversation';
import { ordersService } from '@server/modules/orders/orders.service';
import { usersService } from '@server/modules/users/users.service';

describe('handlePriceInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns false when no pending price conversation exists', async () => {
    mockGetPrice.mockResolvedValue(null);
    const ctx = { reply: vi.fn(), from: { id: 111 } };

    const handled = await handlePriceInput(ctx as any, '111', '4500');
    expect(handled).toBe(false);
    expect(ordersService.update).not.toHaveBeenCalled();
  });

  it('handles /cancel and clears conversation', async () => {
    mockGetPrice.mockResolvedValue({ orderId: 'FB-123' });
    const ctx = { reply: vi.fn(), from: { id: 111 } };

    const handled = await handlePriceInput(ctx as any, '111', '/cancel');
    expect(handled).toBe(true);
    expect(mockClearPrice).toHaveBeenCalledWith('111');
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining('Price entry cancelled'),
      expect.anything()
    );
    expect(ordersService.update).not.toHaveBeenCalled();
  });

  it('warns user when price is invalid', async () => {
    mockGetPrice.mockResolvedValue({ orderId: 'FB-123' });
    const ctx = { reply: vi.fn(), from: { id: 111 } };

    const handled = await handlePriceInput(ctx as any, '111', '10'); // below 50
    expect(handled).toBe(true);
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining('Please enter a valid price in ETB'),
      expect.anything()
    );
    expect(ordersService.update).not.toHaveBeenCalled();
  });

  it('denies price setting when user is not staff', async () => {
    mockGetPrice.mockResolvedValue({ orderId: 'FB-123' });
    vi.mocked(usersService.findByTelegramId).mockResolvedValue({
      id: 'usr_cust_1',
      role: 'customer',
    } as any);
    const ctx = { reply: vi.fn(), from: { id: 111 } };

    const handled = await handlePriceInput(ctx as any, '111', '5000');
    expect(handled).toBe(true);
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining('Only staff or admin'),
      expect.anything()
    );
    expect(ordersService.update).not.toHaveBeenCalled();
  });

  it('updates order through ordersService with real user.id and clears conversation', async () => {
    mockGetPrice.mockResolvedValue({ orderId: 'FB-123' });
    vi.mocked(usersService.findByTelegramId).mockResolvedValue({
      id: 'usr_staff_99',
      role: 'admin',
    } as any);
    const ctx = { reply: vi.fn(), from: { id: 111 } };

    const handled = await handlePriceInput(ctx as any, '111', '5000 ETB');
    expect(handled).toBe(true);
    expect(ordersService.update).toHaveBeenCalledWith(
      'FB-123',
      { price: 5000, status: 'Priced' },
      { source: 'telegram_bot', userId: 'usr_staff_99' }
    );
    expect(mockClearPrice).toHaveBeenCalledWith('111');
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining('Price of <b>5,000 ETB</b> sent'),
      expect.anything()
    );
  });
});
