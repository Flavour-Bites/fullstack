import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@server/platform/integrations/telegram/telegramClient', () => ({
  answerCallback: vi.fn(() => Promise.resolve()),
  editMessage: vi.fn(() => Promise.resolve()),
  sendMessage: vi.fn(() => Promise.resolve()),
}));

vi.mock('@server/platform/integrations/telegram/telegramNotifications', () => ({
  getStaffChatIds: vi.fn(() => Promise.resolve(['staff_1', 'staff_2'])),
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
  },
}));

vi.mock('@server/modules/users/users.service', () => ({
  usersService: {
    findByTelegramId: vi.fn(),
  },
}));

import { handleCallbacks } from '@server/bot/callbacks';
import { ordersService } from '@server/modules/orders/orders.service';
import { usersService } from '@server/modules/users/users.service';
import { editMessage, answerCallback, sendMessage } from '@server/platform/integrations/telegram/telegramClient';

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

  it('routes status update through ordersService.update', async () => {
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

    expect(ordersService.update).toHaveBeenCalledWith(
      'FB-123',
      { status: 'InProgress' },
      { source: 'telegram_bot', userId: '12345' }
    );
    expect(editMessage).toHaveBeenCalled();
    expect(answerCallback).toHaveBeenCalledWith('cb_1', 'Status updated to InProgress');
  });

  it('handles status transition error gracefully', async () => {
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

  it('routes revise callback through ordersService.findById', async () => {
    vi.mocked(ordersService.findById).mockResolvedValue({
      id: 'FB-123',
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
    expect(sendMessage).toHaveBeenCalledTimes(2); // 2 staff members
    expect(editMessage).toHaveBeenCalled();
    expect(answerCallback).toHaveBeenCalledWith(
      'cb_rev',
      'Revision request sent to the baker.'
    );
  });
});

