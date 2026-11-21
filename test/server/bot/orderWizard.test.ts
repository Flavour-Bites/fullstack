import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockSetOrder, mockClearOrder } = vi.hoisted(() => ({
  mockSetOrder: vi.fn(),
  mockClearOrder: vi.fn(),
}));

vi.mock('@server/platform/integrations/redis/conversationState', () => ({
  getConversationStore: () => ({
    setOrder: mockSetOrder,
    clearOrder: mockClearOrder,
  }),
}));

vi.mock('@server/modules/business/businessAvailability.service', () => ({
  businessAvailabilityService: {
    validateOrderDate: vi.fn(),
  },
}));

vi.mock('@server/modules/orders/orders.service', () => ({
  ordersService: {
    create: vi.fn(),
  },
}));

import { handleOrderWizardStep } from '@server/bot/conversations/orderWizard';
import { businessAvailabilityService } from '@server/modules/business/businessAvailability.service';
import { ordersService } from '@server/modules/orders/orders.service';

describe('orderWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates date in eventDate step and rejects unavailable dates', async () => {
    vi.mocked(businessAvailabilityService.validateOrderDate).mockResolvedValue({
      valid: false,
      error: 'Orders for Monday are not accepted.',
    });

    const ctx = { reply: vi.fn() };
    const conv = { step: 'eventDate', eventType: 'Birthday', userId: 'usr_1', contactName: 'Alice' } as any;

    const handled = await handleOrderWizardStep(ctx as any, conv, 'June 22, 2026', 'tg_123');
    expect(handled).toBe(true);
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining('Orders for Monday are not accepted.'),
      expect.anything()
    );
    expect(mockSetOrder).not.toHaveBeenCalled();
  });

  it('routes order creation through ordersService.create on the final step', async () => {
    vi.mocked(ordersService.create).mockResolvedValue({
      id: 'FB-BOT-001',
      status: 'Received',
    } as any);

    const ctx = { reply: vi.fn() };
    const conv = {
      step: 'specialInstructions',
      userId: 'usr_1',
      contactName: 'Alice',
      contactPhone: '+251911223344',
      eventType: 'Birthday',
      guestCount: 20,
      eventDate: 'July 15, 2026',
      designStyle: 'Minimalist',
      flavor: 'Chocolate',
      tierCount: 2,
    } as any;

    const handled = await handleOrderWizardStep(ctx as any, conv, 'Nut allergy', 'tg_123');
    expect(handled).toBe(true);
    expect(ordersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        contactName: 'Alice',
        contactPhone: '+251911223344',
        eventType: 'Birthday',
        guestCount: 20,
        eventDate: 'July 15, 2026',
        flavor: 'Chocolate',
        tierCount: 2,
        specialInstructions: 'Nut allergy',
      }),
      'usr_1',
      'telegram_bot'
    );
    expect(mockClearOrder).toHaveBeenCalledWith('tg_123');
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining('Your cake request has been sent!'),
      expect.anything()
    );
  });
});
