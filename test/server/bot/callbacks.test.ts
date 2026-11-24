import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@server/platform/integrations/telegram/telegramClient', () => ({
  answerCallback: vi.fn(() => Promise.resolve(true)),
  editMessage: vi.fn(() => Promise.resolve(true)),
  sendMessage: vi.fn(() => Promise.resolve(true)),
}));

vi.mock('@server/platform/integrations/telegram/telegramNotifications', () => ({
  notifyStaffRevisionRequested: vi.fn(() => Promise.resolve()),
}));

vi.mock('@server/platform/integrations/redis/conversationState', () => ({
  getConversationStore: () => ({
    setPrice: vi.fn(() => Promise.resolve()),
  }),
}));

vi.mock('@server/modules/orders/orders.service', () => ({
  ordersService: {
    update: vi.fn(),
    acceptPrice: vi.fn(),
    findById: vi.fn(),
    findByIdForUser: vi.fn(),
  },
}));

vi.mock('@server/bot/conversations/orderWizard', () => ({
  handleWizardCallback: vi.fn(() => Promise.resolve(true)),
}));

vi.mock('@server/modules/users/users.service', () => ({
  usersService: {
    findByTelegramId: vi.fn(),
  },
}));

import { handleCallbacks, getStaffActionButtons } from '@server/bot/callbacks';
import { ordersService } from '@server/modules/orders/orders.service';
import { usersService } from '@server/modules/users/users.service';
import { editMessage, answerCallback } from '@server/platform/integrations/telegram/telegramClient';
import { notifyStaffRevisionRequested } from '@server/platform/integrations/telegram/telegramNotifications';
import { handleWizardCallback } from '@server/bot/conversations/orderWizard';

describe('bot callbacks', () => {
  let callbackHandler: (ctx: any) => Promise<void>;

  beforeEach(() => {
    vi.clearAllMocks();
    const mockBot = {
      on: vi.fn((event: string, handler: any) => {
        if (event === 'callback_query:data') {
          callbackHandler = handler;
        }
      }),
    };
    handleCallbacks(mockBot as any);
  });

  describe('getStaffActionButtons', () => {
    it('returns designing, send price, and cancel for Received', () => {
      const buttons = getStaffActionButtons('FB-1', 'Received');
      expect(buttons).toHaveLength(3);
      expect(buttons?.[0][0].text).toContain('Start Designing');
      expect(buttons?.[1][0].text).toContain('Send Price');
      expect(buttons?.[2][0].text).toContain('Cancel Order');
    });

    it('returns send price and cancel for Designing', () => {
      const buttons = getStaffActionButtons('FB-1', 'Designing');
      expect(buttons).toHaveLength(2);
      expect(buttons?.[0][0].text).toContain('Send Price');
      expect(buttons?.[1][0].text).toContain('Cancel Order');
    });

    it('returns mark in progress for Confirmed', () => {
      const buttons = getStaffActionButtons('FB-1', 'Confirmed');
      expect(buttons?.[0][0].text).toContain('Mark In Progress');
    });

    it('returns mark ready for InProgress', () => {
      const buttons = getStaffActionButtons('FB-1', 'InProgress');
      expect(buttons?.[0][0].text).toContain('Mark Ready');
    });

    it('returns mark completed for Ready', () => {
      const buttons = getStaffActionButtons('FB-1', 'Ready');
      expect(buttons?.[0][0].text).toContain('Mark Completed');
    });

    it('returns undefined for terminal statuses', () => {
      expect(getStaffActionButtons('FB-1', 'Completed')).toBeUndefined();
      expect(getStaffActionButtons('FB-1', 'Cancelled')).toBeUndefined();
    });
  });

  describe('staff status transitions', () => {
    it('routes status update through ordersService.update with internal user.id', async () => {
      vi.mocked(usersService.findByTelegramId).mockResolvedValue({
        id: 'usr_staff_99',
        name: 'Yodit',
        role: 'admin',
      } as any);

      const mockOrder = {
        id: 'FB-123',
        contactName: 'Alice',
        eventType: 'Birthday',
        eventDate: 'July 15, 2026',
        status: 'InProgress',
      };
      vi.mocked(ordersService.update).mockResolvedValue(mockOrder as any);

      const ctx = {
        callbackQuery: {
          id: 'cb_1',
          data: 'status:FB-123:InProgress',
          message: { chat: { id: 111 }, message_id: 222 },
        },
        from: { id: 12345 },
      };

      await callbackHandler(ctx);

      expect(usersService.findByTelegramId).toHaveBeenCalledWith('12345');
      expect(ordersService.update).toHaveBeenCalledWith(
        'FB-123',
        { status: 'InProgress' },
        { source: 'telegram_bot', userId: 'usr_staff_99' }
      );
      expect(editMessage).toHaveBeenCalled();
      expect(answerCallback).toHaveBeenCalledWith('cb_1', 'Status updated to InProgress');
    });

    it('denies status change when caller is not staff', async () => {
      vi.mocked(usersService.findByTelegramId).mockResolvedValue({
        id: 'usr_cust_1',
        name: 'Bob',
        role: 'customer',
      } as any);

      const ctx = {
        callbackQuery: {
          id: 'cb_deny',
          data: 'status:FB-123:InProgress',
          message: { chat: { id: 111 }, message_id: 222 },
        },
        from: { id: 12345 },
      };

      await callbackHandler(ctx);

      expect(ordersService.update).not.toHaveBeenCalled();
      expect(answerCallback).toHaveBeenCalledWith(
        'cb_deny',
        expect.stringContaining('Only bakery staff or admin')
      );
    });

    it('handles status transition error gracefully', async () => {
      vi.mocked(usersService.findByTelegramId).mockResolvedValue({
        id: 'usr_staff_1',
        name: 'Staff Member',
        role: 'staff',
      } as any);

      vi.mocked(ordersService.update).mockRejectedValue(new Error('Cannot change status from Completed to Priced'));

      const ctx = {
        callbackQuery: {
          id: 'cb_err',
          data: 'status:FB-123:Priced',
          message: { chat: { id: 111 }, message_id: 222 },
        },
        from: { id: 12345 },
      };

      await callbackHandler(ctx);

      expect(answerCallback).toHaveBeenCalledWith(
        'cb_err',
        '⚠️ Cannot change status from Completed to Priced'
      );
    });
  });

  describe('cancel flows', () => {
    it('shows confirmation prompt on cancel_prompt', async () => {
      vi.mocked(usersService.findByTelegramId).mockResolvedValue({
        id: 'usr_staff_1',
        role: 'admin',
      } as any);
      vi.mocked(ordersService.findById).mockResolvedValue({
        id: 'FB-123',
        contactName: 'Alice',
        status: 'Received',
      } as any);

      const ctx = {
        callbackQuery: {
          id: 'cb_cp',
          data: 'cancel_prompt:FB-123',
          message: { chat: { id: 111 }, message_id: 222 },
        },
        from: { id: 12345 },
      };

      await callbackHandler(ctx);

      expect(editMessage).toHaveBeenCalledWith(
        111,
        222,
        expect.stringContaining('Are you sure you want to cancel order'),
        expect.arrayContaining([
          expect.arrayContaining([
            expect.objectContaining({ text: expect.stringContaining('Confirm Cancellation') }),
            expect.objectContaining({ text: expect.stringContaining('Keep Order') }),
          ]),
        ])
      );
    });

    it('cancels order on cancel_confirm', async () => {
      vi.mocked(usersService.findByTelegramId).mockResolvedValue({
        id: 'usr_staff_1',
        role: 'admin',
      } as any);
      vi.mocked(ordersService.update).mockResolvedValue({
        id: 'FB-123',
        contactName: 'Alice',
        status: 'Cancelled',
      } as any);

      const ctx = {
        callbackQuery: {
          id: 'cb_cc',
          data: 'cancel_confirm:FB-123',
          message: { chat: { id: 111 }, message_id: 222 },
        },
        from: { id: 12345 },
      };

      await callbackHandler(ctx);

      expect(ordersService.update).toHaveBeenCalledWith(
        'FB-123',
        { status: 'Cancelled' },
        expect.objectContaining({ userId: 'usr_staff_1' })
      );
      expect(answerCallback).toHaveBeenCalledWith('cb_cc', 'Order cancelled.');
    });
  });

  describe('customer interactions', () => {
    it('routes confirm callback through usersService and ordersService.acceptPrice', async () => {
      vi.mocked(usersService.findByTelegramId).mockResolvedValue({
        id: 'usr_abc',
        name: 'Alice',
        role: 'customer',
      } as any);

      vi.mocked(ordersService.acceptPrice).mockResolvedValue({
        id: 'FB-123',
        eventType: 'Wedding',
        status: 'Confirmed',
      } as any);

      const ctx = {
        callbackQuery: {
          id: 'cb_conf',
          data: 'confirm:FB-123',
          message: { chat: { id: 111 }, message_id: 222 },
        },
        from: { id: 54321 },
      };

      await callbackHandler(ctx);

      expect(usersService.findByTelegramId).toHaveBeenCalledWith('54321');
      expect(ordersService.acceptPrice).toHaveBeenCalledWith(
        'FB-123',
        'usr_abc',
        'customer',
        'telegram_bot'
      );
      expect(editMessage).toHaveBeenCalled();
      expect(answerCallback).toHaveBeenCalledWith('cb_conf', 'Order confirmed!');
    });

    it('routes revise callback and notifies staff', async () => {
      vi.mocked(usersService.findByTelegramId).mockResolvedValue({
        id: 'usr_cust_1',
        name: 'Bob',
        role: 'customer',
      } as any);

      vi.mocked(ordersService.findById).mockResolvedValue({
        id: 'FB-123',
        userId: 'usr_cust_1',
        contactName: 'Bob',
      } as any);

      const ctx = {
        callbackQuery: {
          id: 'cb_rev',
          data: 'revise:FB-123',
          message: { chat: { id: 111 }, message_id: 222 },
        },
        from: { id: 54321 },
      };

      await callbackHandler(ctx);

      expect(ordersService.findById).toHaveBeenCalledWith('FB-123');
      expect(notifyStaffRevisionRequested).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'FB-123' })
      );
      expect(editMessage).toHaveBeenCalled();
      expect(answerCallback).toHaveBeenCalledWith(
        'cb_rev',
        'Revision request sent to Yodit.'
      );
    });

    it('routes wiz_ callbacks to handleWizardCallback', async () => {
      const ctx = {
        callbackQuery: {
          id: 'cb_wiz',
          data: 'wiz_event:Birthday',
          message: { chat: { id: 111 }, message_id: 222 },
        },
        from: { id: 12345 },
      };

      await callbackHandler(ctx);

      expect(answerCallback).toHaveBeenCalledWith('cb_wiz');
      expect(handleWizardCallback).toHaveBeenCalledWith(ctx, 'wiz_event:Birthday', '12345');
    });

    it('routes view_order: callback and displays order card', async () => {
      vi.mocked(usersService.findByTelegramId).mockResolvedValue({
        id: 'usr_cust_1',
        name: 'Bob',
        role: 'customer',
      } as any);

      vi.mocked(ordersService.findByIdForUser).mockResolvedValue({
        id: 'FB-VIEW-123',
        status: 'Priced',
        eventType: 'Birthday Party',
        contactName: 'Bob',
        contactPhone: '+251911223344',
        flavor: 'Vanilla',
        eventDate: '2026-08-15',
        guestCount: 25,
        tierCount: 2,
        price: 3500,
        finalPrice: 3500,
      } as any);

      const ctx = {
        callbackQuery: {
          id: 'cb_view',
          data: 'view_order:FB-VIEW-123',
          message: { chat: { id: 111 }, message_id: 222 },
        },
        from: { id: 54321 },
        reply: vi.fn(),
      };

      await callbackHandler(ctx);

      expect(answerCallback).toHaveBeenCalledWith('cb_view');
      expect(ordersService.findByIdForUser).toHaveBeenCalledWith('FB-VIEW-123', {
        id: 'usr_cust_1',
        role: 'customer',
      });
      expect(ctx.reply).toHaveBeenCalledWith(
        expect.stringContaining('Order #FB-VIEW-123'),
        expect.objectContaining({ parse_mode: 'HTML' })
      );
    });
  });
});
