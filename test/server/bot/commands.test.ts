import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@server/modules/users/users.service', () => ({
  usersService: {
    findByTelegramId: vi.fn(),
  },
}));

vi.mock('@server/modules/orders/orders.service', () => ({
  ordersService: {
    findById: vi.fn(),
    findByIdForUser: vi.fn(),
    findActiveByUserId: vi.fn(),
  },
}));

vi.mock('@server/modules/business/businessAvailability.service', () => ({
  businessAvailabilityService: {
    getAvailabilityResponse: vi.fn(),
  },
}));

vi.mock('@server/platform/integrations/redis/conversationState', () => ({
  getConversationStore: () => ({
    setOrder: vi.fn(() => Promise.resolve()),
    clearOrder: vi.fn(() => Promise.resolve()),
    clearPrice: vi.fn(() => Promise.resolve()),
  }),
}));

vi.mock('@server/platform/config/env', () => ({
  env: {
    FRONTEND_URL: 'https://test-flavour-bites.example.com',
  },
}));

import { handleStartCommand } from '@server/bot/commands/start.command';
import { handleStatusCommand } from '@server/bot/commands/status.command';
import { handleOrderCommand } from '@server/bot/commands/order.command';
import { handleHelpCommand } from '@server/bot/commands/help.command';
import { handleCancelCommand } from '@server/bot/commands/cancel.command';
import { usersService } from '@server/modules/users/users.service';
import { ordersService } from '@server/modules/orders/orders.service';
import { businessAvailabilityService } from '@server/modules/business/businessAvailability.service';

describe('bot commands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('start command', () => {
    it('prompts unlinked user to link Telegram account when accessing order deep link', async () => {
      vi.mocked(usersService.findByTelegramId).mockResolvedValue(null);

      const ctx = {
        from: { id: 111 },
        match: 'order_FB-999',
        reply: vi.fn(),
      };

      await handleStartCommand(ctx as any);

      expect(ctx.reply).toHaveBeenCalledWith(
        expect.stringContaining('Please link your Telegram account'),
        expect.anything()
      );
      expect(ordersService.findByIdForUser).not.toHaveBeenCalled();
    });

    it('rejects access when user does not have permission to view order', async () => {
      vi.mocked(usersService.findByTelegramId).mockResolvedValue({
        id: 'usr_other',
        role: 'customer',
        name: 'Eve',
      } as any);
      vi.mocked(ordersService.findByIdForUser).mockResolvedValue(null);

      const ctx = {
        from: { id: 111 },
        match: 'order_FB-999',
        reply: vi.fn(),
      };

      await handleStartCommand(ctx as any);

      expect(ordersService.findByIdForUser).toHaveBeenCalledWith('FB-999', { id: 'usr_other', role: 'customer' });
      expect(ctx.reply).toHaveBeenCalledWith(
        expect.stringContaining('was not found or you do not have permission'),
        expect.anything()
      );
    });

    it('displays order details with escaped HTML and formatted date when authorized', async () => {
      vi.mocked(usersService.findByTelegramId).mockResolvedValue({
        id: 'usr_staff',
        role: 'staff',
        name: 'Staff Member',
      } as any);
      vi.mocked(ordersService.findByIdForUser).mockResolvedValue({
        id: 'FB-999',
        status: 'Received',
        contactName: 'Bob <script>',
        contactPhone: '+251911111111',
        eventType: 'Anniversary & Party',
        flavor: 'Vanilla',
        eventDate: '2026-08-01',
        guestCount: 50,
        tierCount: 3,
        price: 5000,
      } as any);

      const ctx = {
        from: { id: 111 },
        match: 'order_FB-999',
        reply: vi.fn(),
      };

      await handleStartCommand(ctx as any);

      expect(ordersService.findByIdForUser).toHaveBeenCalledWith('FB-999', { id: 'usr_staff', role: 'staff' });
      expect(ctx.reply).toHaveBeenCalledWith(
        expect.stringContaining('Bob &lt;script&gt;'),
        expect.anything()
      );
      expect(ctx.reply).toHaveBeenCalledWith(
        expect.stringContaining('Aug 1, 2026'),
        expect.anything()
      );
    });

    it('looks up user via usersService for general start', async () => {
      vi.mocked(usersService.findByTelegramId).mockResolvedValue({
        id: 'usr_1',
        name: 'Sara',
      } as any);

      const ctx = {
        from: { id: 222 },
        match: '',
        reply: vi.fn(),
      };

      await handleStartCommand(ctx as any);

      expect(usersService.findByTelegramId).toHaveBeenCalledWith('222');
      expect(ctx.reply).toHaveBeenCalledWith(
        expect.stringContaining('Welcome back, <b>Sara</b>!'),
        expect.anything()
      );
    });

    it('prompts unlinked users with dynamic website link', async () => {
      vi.mocked(usersService.findByTelegramId).mockResolvedValue(null);

      const ctx = {
        from: { id: 333 },
        match: '',
        reply: vi.fn(),
      };

      await handleStartCommand(ctx as any);

      expect(ctx.reply).toHaveBeenCalledWith(
        expect.stringContaining('href="https://test-flavour-bites.example.com"'),
        expect.anything()
      );
      expect(ctx.reply).toHaveBeenCalledWith(
        expect.stringContaining('test-flavour-bites.example.com'),
        expect.anything()
      );
    });
  });

  describe('status command', () => {
    it('checks active orders via usersService and ordersService', async () => {
      vi.mocked(usersService.findByTelegramId).mockResolvedValue({
        id: 'usr_1',
        name: 'Sara',
      } as any);

      vi.mocked(ordersService.findActiveByUserId).mockResolvedValue([
        {
          id: 'FB-100',
          eventType: 'Graduation',
          status: 'InProgress',
          eventDate: 'July 20, 2026',
        } as any,
      ]);

      const ctx = {
        from: { id: 222 },
        reply: vi.fn(),
      };

      await handleStatusCommand(ctx as any);

      expect(usersService.findByTelegramId).toHaveBeenCalledWith('222');
      expect(ordersService.findActiveByUserId).toHaveBeenCalledWith('usr_1', 5);
      expect(ctx.reply).toHaveBeenCalledWith(
        expect.stringContaining('Graduation Cake'),
        expect.anything()
      );
    });

    it('prompts unlinked user with dynamic website link', async () => {
      vi.mocked(usersService.findByTelegramId).mockResolvedValue(null);

      const ctx = {
        from: { id: 333 },
        reply: vi.fn(),
      };

      await handleStatusCommand(ctx as any);

      expect(ctx.reply).toHaveBeenCalledWith(
        expect.stringContaining('href="https://test-flavour-bites.example.com"'),
        expect.anything()
      );
    });
  });

  describe('order command', () => {
    it('looks up user and starts order wizard if available', async () => {
      vi.mocked(usersService.findByTelegramId).mockResolvedValue({
        id: 'usr_1',
        name: 'Sara',
        telegramPhone: '+251911223344',
      } as any);

      vi.mocked(businessAvailabilityService.getAvailabilityResponse).mockResolvedValue({
        isEnabled: true,
        timezone: 'Africa/Addis_Ababa',
        minimumLeadTimeHours: 24,
        days: {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: true,
          sunday: true,
        },
      });

      const ctx = {
        from: { id: 222 },
        reply: vi.fn(),
      };

      await handleOrderCommand(ctx as any);

      expect(usersService.findByTelegramId).toHaveBeenCalledWith('222');
      expect(ctx.reply).toHaveBeenCalledWith(
        expect.stringContaining("Let's make your cake!"),
        expect.anything()
      );
    });

    it('prompts unlinked user with dynamic website link', async () => {
      vi.mocked(usersService.findByTelegramId).mockResolvedValue(null);

      const ctx = {
        from: { id: 333 },
        reply: vi.fn(),
      };

      await handleOrderCommand(ctx as any);

      expect(ctx.reply).toHaveBeenCalledWith(
        expect.stringContaining('href="https://test-flavour-bites.example.com"'),
        expect.anything()
      );
    });
  });

  describe('help command', () => {
    it('replies with dynamic website link', async () => {
      const ctx = {
        reply: vi.fn(),
      };

      await handleHelpCommand(ctx as any);

      expect(ctx.reply).toHaveBeenCalledWith(
        expect.stringContaining('href="https://test-flavour-bites.example.com"'),
        expect.anything()
      );
    });
  });

  describe('cancel command', () => {
    it('clears active order and price state and replies confirmation', async () => {
      const ctx = {
        from: { id: 777 },
        reply: vi.fn(),
      };

      await handleCancelCommand(ctx as any);

      expect(ctx.reply).toHaveBeenCalledWith(
        expect.stringContaining('Active order request or action cancelled'),
        expect.objectContaining({ reply_markup: { remove_keyboard: true } })
      );
    });
  });
});

