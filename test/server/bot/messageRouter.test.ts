import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockClearOrder, mockClearPrice, mockGetOrder } = vi.hoisted(() => ({
  mockClearOrder: vi.fn(),
  mockClearPrice: vi.fn(),
  mockGetOrder: vi.fn(),
}));

vi.mock('@server/platform/integrations/redis/conversationState', () => ({
  getConversationStore: () => ({
    clearOrder: mockClearOrder,
    clearPrice: mockClearPrice,
    getOrder: mockGetOrder,
  }),
}));

vi.mock('@server/bot/conversations/priceConversation', () => ({
  handlePriceInput: vi.fn(),
}));

vi.mock('@server/bot/conversations/orderWizard', () => ({
  handleOrderWizardStep: vi.fn(),
}));

import { registerMessageRouter } from '@server/bot/conversations/messageRouter';
import { handlePriceInput } from '@server/bot/conversations/priceConversation';
import { handleOrderWizardStep } from '@server/bot/conversations/orderWizard';

describe('messageRouter', () => {
  const handlers: Record<string, (ctx: any, next?: any) => Promise<any>> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    const mockBot = {
      on: vi.fn((event, handler) => {
        handlers[event] = handler;
      }),
      command: vi.fn((cmd, handler) => {
        handlers[`cmd:${cmd}`] = handler;
      }),
    };
    registerMessageRouter(mockBot as any);
  });

  it('cancels active conversations when text is /cancel or cancel', async () => {
    const ctx = {
      from: { id: 123 },
      message: { text: '/cancel' },
      reply: vi.fn(),
    };
    const next = vi.fn();

    await handlers['message:text'](ctx, next);

    expect(mockClearOrder).toHaveBeenCalledWith('123');
    expect(mockClearPrice).toHaveBeenCalledWith('123');
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining('Active request cancelled'),
      expect.objectContaining({ reply_markup: { remove_keyboard: true } })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('routes photo message to order wizard on designStyle step', async () => {
    mockGetOrder.mockResolvedValue({
      step: 'designStyle',
      userId: 'usr_1',
    });

    const ctx = {
      from: { id: 123 },
      message: {
        photo: [{ file_id: 'small' }, { file_id: 'large_photo_id' }],
        caption: 'Gold and floral themed',
      },
      reply: vi.fn(),
    };
    const next = vi.fn();

    await handlers['message:photo'](ctx, next);

    expect(handleOrderWizardStep).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        step: 'designStyle',
        referenceImage: 'large_photo_id',
      }),
      'Gold and floral themed',
      '123'
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('routes contact message to order wizard on contactPhone step', async () => {
    mockGetOrder.mockResolvedValue({
      step: 'contactPhone',
      userId: 'usr_1',
    });

    const ctx = {
      from: { id: 123 },
      message: {
        contact: {
          phone_number: '+251911223344',
        },
      },
      reply: vi.fn(),
    };
    const next = vi.fn();

    await handlers['message:contact'](ctx, next);

    expect(handleOrderWizardStep).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        step: 'contactPhone',
      }),
      '+251911223344',
      '123'
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('routes staff price input when handlePriceInput returns true', async () => {
    vi.mocked(handlePriceInput).mockResolvedValue(true);

    const ctx = {
      from: { id: 456 },
      message: { text: '4500' },
      reply: vi.fn(),
    };
    const next = vi.fn();

    await handlers['message:text'](ctx, next);

    expect(handlePriceInput).toHaveBeenCalledWith(ctx, '456', '4500');
    expect(handleOrderWizardStep).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('routes customer order wizard step when active order exists', async () => {
    vi.mocked(handlePriceInput).mockResolvedValue(false);
    mockGetOrder.mockResolvedValue({
      step: 'guestCount',
      userId: 'usr_1',
    });
    vi.mocked(handleOrderWizardStep).mockResolvedValue(true);

    const ctx = {
      from: { id: 789 },
      message: { text: '25' },
      reply: vi.fn(),
    };
    const next = vi.fn();

    await handlers['message:text'](ctx, next);

    expect(handleOrderWizardStep).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ step: 'guestCount' }),
      '25',
      '789'
    );
    expect(next).not.toHaveBeenCalled();
  });
});

