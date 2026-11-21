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

import { handlePriceInput } from '@server/bot/conversations/priceConversation';
import { ordersService } from '@server/modules/orders/orders.service';

describe('handlePriceInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns false when no pending price conversation exists', async () => {
    mockGetPrice.mockResolvedValue(null);
    const ctx = { reply: vi.fn() };

    const handled = await handlePriceInput(ctx as any, 'user_1', '4500');
    expect(handled).toBe(false);
    expect(ordersService.update).not.toHaveBeenCalled();
  });

  it('warns user when price is invalid', async () => {
    mockGetPrice.mockResolvedValue({ orderId: 'FB-123' });
    const ctx = { reply: vi.fn() };

    const handled = await handlePriceInput(ctx as any, 'user_1', '10'); // below 50
    expect(handled).toBe(true);
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining('Please enter a valid price in ETB'),
      expect.anything()
    );
    expect(ordersService.update).not.toHaveBeenCalled();
  });

  it('updates order through ordersService and clears conversation', async () => {
    mockGetPrice.mockResolvedValue({ orderId: 'FB-123' });
    const ctx = { reply: vi.fn() };

    const handled = await handlePriceInput(ctx as any, 'staff_1', '5000 ETB');
    expect(handled).toBe(true);
    expect(ordersService.update).toHaveBeenCalledWith(
      'FB-123',
      { price: 5000, status: 'Priced' },
      { source: 'telegram_bot', userId: 'staff_1' }
    );
    expect(mockClearPrice).toHaveBeenCalledWith('staff_1');
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining('Price of <b>5,000 ETB</b> sent'),
      expect.anything()
    );
  });
});
