import { CommandContext, Context } from 'grammy';
import { usersService } from '../../modules/users/users.service';
import { ordersService } from '../../modules/orders/orders.service';
import { STATUS_EMOJI } from '../../../shared/constants/orderStatus';
import { getWebsiteHtmlLink, escapeHtml, formatDate, formatCurrency } from '../botHelpers';

export async function handleStatusCommand(ctx: CommandContext<Context>): Promise<void> {
  const telegramId = String(ctx.from?.id);

  const user = await usersService.findByTelegramId(telegramId);

  if (!user) {
    await ctx.reply(
      `⚠️ Your Telegram account isn't linked yet.\n\nVisit ${getWebsiteHtmlLink()} and sign in with Telegram to link your account.`,
      { parse_mode: 'HTML' }
    );
    return;
  }

  const activeOrders = await ordersService.findActiveByUserId(user.id, 5);

  if (activeOrders.length === 0) {
    await ctx.reply(
      `Hi <b>${escapeHtml(user.name)}</b>! You have no active orders right now.\n\nUse /order to start a new cake request. 🎂`,
      { parse_mode: 'HTML' }
    );
    return;
  }

  await ctx.reply(
    `Hi <b>${escapeHtml(user.name)}</b>! Here are your active orders:`,
    { parse_mode: 'HTML' }
  );

  for (let i = 0; i < activeOrders.length; i++) {
    const r = activeOrders[i];
    const emoji = STATUS_EMOJI[r.status] ?? '📦';
    const dateFormatted = formatDate(r.eventDate);
    const priceText = r.price ? ` · ${formatCurrency(r.finalPrice ?? r.price)}` : '';

    const text =
      `<b>${i + 1}. ${escapeHtml(r.eventType)} Cake</b>\n` +
      `   ${emoji} <b>Status:</b> ${escapeHtml(r.status)}\n` +
      `   📅 <b>Date:</b> ${escapeHtml(dateFormatted)}\n` +
      `   🆔 <code>${escapeHtml(r.id)}</code>${priceText}`;

    const buttons = [];
    if (r.status === 'Priced') {
      const priceQuote = formatCurrency(r.finalPrice ?? r.price);
      buttons.push([
        { text: `✅ Accept Price (${priceQuote})`, callback_data: `confirm:${r.id}` },
      ]);
      buttons.push([
        { text: '✏️ Request Revision', callback_data: `revise:${r.id}` },
        { text: '🔍 View Details', callback_data: `view_order:${r.id}` },
      ]);
    } else {
      buttons.push([
        { text: '🔍 View Details', callback_data: `view_order:${r.id}` },
      ]);
    }

    await ctx.reply(text, {
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: buttons },
    });
  }
}
