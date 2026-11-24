import { describe, it, expect, vi } from 'vitest';
import {
  escapeHtml,
  formatDate,
  formatCurrency,
  isStaffUser,
  requireStaff,
  resolveTelegramUser,
  formatOrderSummary,
} from '@server/bot/botHelpers';
import { usersService } from '@server/modules/users/users.service';

vi.mock('@server/modules/users/users.service', () => ({
  usersService: {
    findByTelegramId: vi.fn(),
  },
}));

describe('botHelpers', () => {
  describe('escapeHtml', () => {
    it('escapes special characters for Telegram HTML mode', () => {
      expect(escapeHtml('Hello & welcome <cake> "special"')).toBe(
        'Hello &amp; welcome &lt;cake&gt; &quot;special&quot;'
      );
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
    });
  });

  describe('formatDate', () => {
    it('formats a date string or Date object', () => {
      const formatted = formatDate('2026-07-15T00:00:00Z');
      expect(formatted).toBe('Jul 15, 2026');
      expect(formatDate(null)).toBe('TBD');
    });

    it('returns raw string when invalid date is provided', () => {
      expect(formatDate('not-a-date')).toBe('not-a-date');
    });
  });

  describe('formatCurrency', () => {
    it('formats amount in ETB', () => {
      expect(formatCurrency(4500)).toBe('4,500 ETB');
      expect(formatCurrency(0)).toBe('0 ETB');
      expect(formatCurrency(null)).toBe('Not quoted');
    });
  });

  describe('isStaffUser and requireStaff', () => {
    it('returns true for admin and staff roles', () => {
      expect(isStaffUser({ role: 'admin' })).toBe(true);
      expect(isStaffUser({ role: 'staff' })).toBe(true);
      expect(requireStaff({ role: 'admin' })).toBe(true);
    });

    it('returns false for customer or missing user', () => {
      expect(isStaffUser({ role: 'customer' })).toBe(false);
      expect(isStaffUser(null)).toBe(false);
      expect(requireStaff(undefined)).toBe(false);
    });
  });

  describe('resolveTelegramUser', () => {
    it('resolves user by sender telegramId', async () => {
      vi.mocked(usersService.findByTelegramId).mockResolvedValue({
        id: 'usr_1',
        name: 'Staff Alice',
        role: 'staff',
        telegramId: '123456',
        telegramUsername: 'alice',
        notifyViaTelegram: true,
      } as any);

      const ctx = { from: { id: 123456 } };
      const user = await resolveTelegramUser(ctx as any);

      expect(usersService.findByTelegramId).toHaveBeenCalledWith('123456');
      expect(user?.id).toBe('usr_1');
    });

    it('returns null if from.id is missing', async () => {
      const ctx = { from: undefined };
      const user = await resolveTelegramUser(ctx as any);
      expect(user).toBeNull();
    });
  });

  describe('formatOrderSummary', () => {
    it('formats full order summary with escaped values and emojis', () => {
      const summary = formatOrderSummary({
        id: 'FB-999',
        status: 'Designing',
        contactName: 'Alice & Bob',
        eventType: 'Wedding',
        flavor: 'Vanilla & Chocolate',
        eventDate: '2026-08-01',
        guestCount: 50,
        tierCount: 3,
        price: 8500,
        contactPhone: '+251911223344',
        notes: '<No nuts>',
      });

      expect(summary).toContain('Order #FB-999');
      expect(summary).toContain('✏️ <b>Status:</b> Designing');
      expect(summary).toContain('Alice &amp; Bob');
      expect(summary).toContain('Vanilla &amp; Chocolate');
      expect(summary).toContain('8,500 ETB');
      expect(summary).toContain('&lt;No nuts&gt;');
    });
  });
});

