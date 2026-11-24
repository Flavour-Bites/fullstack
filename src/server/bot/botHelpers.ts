import type { Context } from 'grammy';
import { env } from '../platform/config/env';
import { usersService } from '../modules/users/users.service';

export interface TelegramBotUser {
  id: string;
  name: string;
  role: string;
  telegramId: string;
  telegramUsername: string | null;
  telegramPhone?: string | null;
  notifyViaTelegram: boolean;
}

/**
 * Escapes characters for Telegram HTML mode: &, <, >, ", '
 */
export function escapeHtml(text?: unknown): string {
  if (text === null || text === undefined) return '';
  const str = typeof text === 'string' ? text : String(text);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Formats a date string or Date object into a readable date for Telegram messages.
 */
export function formatDate(dateInput?: string | Date | null): string {
  if (!dateInput) return 'TBD';
  const parsed = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(parsed.getTime())) {
    return String(dateInput);
  }
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats a number as ETB currency.
 */
export function formatCurrency(amount?: number | null): string {
  if (amount === undefined || amount === null) return 'Not quoted';
  return `${amount.toLocaleString()} ETB`;
}

/**
 * Resolves the authenticated internal User corresponding to the Telegram message/callback sender.
 */
export async function resolveTelegramUser(ctx: Context): Promise<TelegramBotUser | null> {
  const senderId = ctx.from?.id;
  if (!senderId) return null;
  return (await usersService.findByTelegramId(String(senderId))) as TelegramBotUser | null;
}

/**
 * Checks if a user has staff or admin operational rights.
 */
export function isStaffUser(user?: { role?: string } | null): boolean {
  if (!user?.role) return false;
  return user.role === 'admin' || user.role === 'staff';
}

/**
 * Ensures the resolved user is staff or admin. Throws an error or returns false if not.
 */
export function requireStaff(user?: { role?: string } | null): boolean {
  return isStaffUser(user);
}

/**
 * Formats a standardized order summary block for Telegram notifications.
 */
export function formatOrderSummary(order: {
  id: string;
  status: string;
  contactName: string;
  contactPhone?: string | null;
  eventType: string;
  flavor: string;
  eventDate: string;
  guestCount?: number | null;
  tierCount?: number | null;
  price?: number | null;
  notes?: string | null;
}): string {
  const statusEmoji: Record<string, string> = {
    Received: '📬',
    Designing: '✏️',
    Priced: '💰',
    Confirmed: '✅',
    InProgress: '🔥',
    Ready: '🎂',
    Completed: '✔️',
    Cancelled: '❌',
  };
  const emoji = statusEmoji[order.status] ?? '📦';

  let text =
    `<b>🎂 Order #${escapeHtml(order.id)}</b>\n` +
    `${emoji} <b>Status:</b> ${escapeHtml(order.status)}\n` +
    `👤 <b>Customer:</b> ${escapeHtml(order.contactName)}\n` +
    `🎉 <b>Event:</b> ${escapeHtml(order.eventType)}\n` +
    `🍰 <b>Flavor:</b> ${escapeHtml(order.flavor)}\n` +
    `📅 <b>Date:</b> ${formatDate(order.eventDate)}\n`;

  if (order.guestCount) {
    text += `👥 <b>Guests:</b> ${order.guestCount}\n`;
  }
  if (order.tierCount) {
    text += `🏗️ <b>Tiers:</b> ${order.tierCount}\n`;
  }
  if (order.price) {
    text += `💰 <b>Price:</b> ${formatCurrency(order.price)}\n`;
  }
  if (order.contactPhone) {
    text += `📞 <b>Phone:</b> ${escapeHtml(order.contactPhone)}\n`;
  }
  if (order.notes) {
    text += `📝 <b>Notes:</b> ${escapeHtml(order.notes)}\n`;
  }

  return text;
}

/**
 * Returns a formatted, clickable HTML link to the configured frontend website.
 * Uses env.FRONTEND_URL so it automatically matches the active environment
 * (e.g., localhost in dev, preview domain in preview, custom domain in prod).
 */
export function getWebsiteHtmlLink(): string {
  const urlStr = env.FRONTEND_URL;
  try {
    const parsed = new URL(urlStr);
    return `<a href="${urlStr}">${parsed.host}</a>`;
  } catch {
    return `<a href="${urlStr}">${urlStr}</a>`;
  }
}

/**
 * Returns the raw frontend website URL from the environment configuration.
 */
export function getWebsiteUrl(): string {
  return env.FRONTEND_URL;
}

