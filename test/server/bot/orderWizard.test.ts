import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockSetOrder, mockClearOrder, mockGetOrder } = vi.hoisted(() => ({
  mockSetOrder: vi.fn(),
  mockClearOrder: vi.fn(),
  mockGetOrder: vi.fn(),
}));

vi.mock('@server/platform/integrations/redis/conversationState', () => ({
  getConversationStore: () => ({
    setOrder: mockSetOrder,
    clearOrder: mockClearOrder,
    getOrder: mockGetOrder,
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

import {
  handleOrderWizardStep,
  handleWizardCallback,
} from '@server/bot/conversations/orderWizard';
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

  it('stores normalizedDate and moves to guestCount step on valid date', async () => {
    vi.mocked(businessAvailabilityService.validateOrderDate).mockResolvedValue({
      valid: true,
      normalizedDate: '2026-07-15',
    });

    const ctx = { reply: vi.fn() };
    const conv = { step: 'eventDate', eventType: 'Birthday', userId: 'usr_1', contactName: 'Alice' } as any;

    const handled = await handleOrderWizardStep(ctx as any, conv, 'July 15, 2026', 'tg_123');
    expect(handled).toBe(true);
    expect(conv.eventDate).toBe('2026-07-15');
    expect(conv.step).toBe('guestCount');
    expect(mockSetOrder).toHaveBeenCalledWith('tg_123', conv);
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining('2026-07-15'),
      expect.anything()
    );
  });

  it('moves to summary step and renders review card on specialInstructions step', async () => {
    const ctx = { reply: vi.fn() };
    const conv = {
      step: 'specialInstructions',
      userId: 'usr_1',
      contactName: 'Alice',
      contactPhone: '+251911223344',
      eventType: 'Birthday',
      guestCount: 20,
      eventDate: '2026-07-15',
      designStyle: 'Minimalist',
      flavor: 'Chocolate',
      tierCount: 2,
    } as any;

    const handled = await handleOrderWizardStep(ctx as any, conv, 'Nut allergy', 'tg_123');
    expect(handled).toBe(true);
    expect(conv.specialInstructions).toBe('Nut allergy');
    expect(conv.step).toBe('summary');
    expect(mockSetOrder).toHaveBeenCalledWith('tg_123', conv);
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining('Review Your Cake Request:'),
      expect.anything()
    );
  });

  it('routes order creation through ordersService.create when confirmed on summary step', async () => {
    vi.mocked(ordersService.create).mockResolvedValue({
      id: 'FB-BOT-001',
      status: 'Received',
    } as any);

    const ctx = { reply: vi.fn() };
    const conv = {
      step: 'summary',
      userId: 'usr_1',
      contactName: 'Alice',
      contactPhone: '+251911223344',
      eventType: 'Birthday',
      guestCount: 20,
      eventDate: '2026-07-15',
      designStyle: 'Minimalist',
      flavor: 'Chocolate',
      tierCount: 2,
      specialInstructions: 'Nut allergy',
    } as any;

    const handled = await handleOrderWizardStep(ctx as any, conv, 'confirm', 'tg_123');
    expect(handled).toBe(true);
    expect(ordersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        contactName: 'Alice',
        contactPhone: '+251911223344',
        eventType: 'Birthday',
        guestCount: 20,
        eventDate: '2026-07-15',
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

  it('handles button callbacks like wiz_event, wiz_back, wiz_cancel and wiz_confirm', async () => {
    const ctx = { reply: vi.fn() };
    const conv = {
      step: 'eventType',
      userId: 'usr_1',
      contactName: 'Alice',
      contactPhone: '+251911223344',
    } as any;

    mockGetOrder.mockResolvedValue(conv);

    // 1. wiz_event:Wedding
    const eventHandled = await handleWizardCallback(ctx as any, 'wiz_event:Wedding', 'tg_123');
    expect(eventHandled).toBe(true);
    expect(conv.eventType).toBe('Wedding');
    expect(conv.step).toBe('eventDate');

    // 2. wiz_back from eventDate back to eventType
    const backHandled = await handleWizardCallback(ctx as any, 'wiz_back', 'tg_123');
    expect(backHandled).toBe(true);
    expect(conv.step).toBe('eventType');

    // 3. wiz_cancel
    const cancelHandled = await handleWizardCallback(ctx as any, 'wiz_cancel', 'tg_123');
    expect(cancelHandled).toBe(true);
    expect(mockClearOrder).toHaveBeenCalledWith('tg_123');
    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining('Cake request cancelled'),
      expect.anything()
    );
  });
});
