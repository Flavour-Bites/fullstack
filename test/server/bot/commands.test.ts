import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@server/modules/users/users.service', () => ({
  usersService: {
    findByTelegramId: vi.fn(),
  },
}));

vi.mock('@server/modules/orders/orders.service', () => ({
  ordersService: {
    findById: vi.fn(),
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
import { usersService } from '@server/modules/users/users.service';
import { ordersService } from '@server/modules/orders/orders.service';
import { businessAvailabilityService } from '@server/modules/business/businessAvailability.service';

describe('bot commands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('start command', () => {
    it('looks up order via ordersService when deep-link payload provided', async () => {
      vi.mocked(ordersService.findById).mockResolvedValue({
        id: 'FB-999',
        status: 'Received',
        contactName: 'Bob',
        contactPhone: '+251911111111',
        eventType: 'Anniversary',
        flavor: 'Vanilla',
        eventDate: 'August 1, 2026',
        guestCount: 50,
        tierCount: 3,
        price: null,
      } as any);

      const ctx = {
        from: { id: 111 },
        match: 'order_FB-999',
        reply: vi.fn(),
      };

      await handleStartCommand(ctx as any);

      expect(ordersService.findById).toHaveBeenCalledWith('FB-999');
      expect(ctx.reply).toHaveBeenCalledWith(
        expect.stringContaining('Order #FB-999'),
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
});

