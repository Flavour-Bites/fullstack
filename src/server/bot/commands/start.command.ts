import { CommandContext, Context } from 'grammy';
import { ordersService } from '../../modules/orders/orders.service';
import { usersService } from '../../modules/users/users.service';
import { STATUS_EMOJI } from '../../../shared/constants/orderStatus';
import { BUSINESS_INFO } from '../../../shared/constants/business';
import { getWebsiteHtmlLink, resolveTelegramUser, escapeHtml, formatDate, formatCurrency } from '../botHelpers';

export async function handleStartCommand(ctx: CommandContext<Context>): Promise<void> {
  const telegramId = String(ctx.from?.id);
  const payload = ctx.match?.toString().trim();

  if (payload?.startsWith('order_')) {
    const orderId = payload.slice(6);
    const user = await resolveTelegramUser(ctx);

    if (!user) {
      await ctx.reply(
        `⚠️ Please link your Telegram account to view order details.\n\nVisit: <b>${getWebsiteHtmlLink()}</b>`,
        { parse_mode: 'HTML' }
      );
      return;
    }

    const order = await ordersService.findByIdForUser(orderId, { id: user.id, role: user.role });

    if (!order) {
      await ctx.reply(
        `⚠️ Order <code>${escapeHtml(orderId)}</code> was not found or you do not have permission to view it.\n\nUse /start to see the main menu.`,
        { parse_mode: 'HTML' }
      );
      return;
    }

    const emoji = STATUS_EMOJI[order.status] ?? '📦';
    const formattedDate = formatDate(order.eventDate);

    let msg =
      `<b>🎂 Order #${escapeHtml(order.id)}</b>\n\n` +
      `${emoji} <b>Status:</b> ${escapeHtml(order.status)}\n` +
      `👤 <b>Customer:</b> ${escapeHtml(order.contactName)}\n` +
      `📞 <b>Phone:</b> ${escapeHtml(order.contactPhone)}\n` +
      `🎉 <b>Event:</b> ${escapeHtml(order.eventType)}\n` +
      `🍰 <b>Flavor:</b> ${escapeHtml(order.flavor)}\n` +
      `📅 <b>Event Date:</b> ${escapeHtml(formattedDate)}\n` +
      `👥 <b>Guests:</b> ${order.guestCount}\n` +
      `🏗️ <b>Tiers:</b> ${order.tierCount}\n`;

    const effectivePrice = order.finalPrice ?? order.price;
    if (effectivePrice) {
      msg += `💰 <b>Total Price:</b> ${formatCurrency(effectivePrice)}\n`;
    }

    const replyOptions: any = { parse_mode: 'HTML' };

    if (order.status === 'Priced') {
      const priceQuote = formatCurrency(effectivePrice);
      const depositRequired = Math.round((effectivePrice || 0) * 0.5);

      msg += `💵 <b>Deposit Required (50%):</b> ${formatCurrency(depositRequired)}\n`;
      if (order.bakerNote) {
        msg += `📝 <b>Note from Yodit:</b> <i>${escapeHtml(order.bakerNote)}</i>\n`;
      }
      msg += `\n<i>Please accept the quote or request a revision below.</i>`;

      replyOptions.reply_markup = {
        inline_keyboard: [
          [{ text: `✅ Accept Price (${priceQuote})`, callback_data: `confirm:${order.id}` }],
          [
            { text: '✏️ Request Revision', callback_data: `revise:${order.id}` },
            { text: '📊 My Orders', callback_data: 'my_orders' },
          ],
        ],
      };
    } else if (order.status === 'Received' || order.status === 'Designing') {
      msg += `\n<i>⏳ Yodit is reviewing your cake design and will quote a price shortly. You will receive an alert right here!</i>`;
      replyOptions.reply_markup = {
        inline_keyboard: [
          [
            { text: '📊 My Orders', callback_data: 'my_orders' },
            { text: '🎂 New Request', callback_data: 'wiz_start' },
          ],
        ],
      };
    } else {
      replyOptions.reply_markup = {
        inline_keyboard: [
          [
            { text: '📊 My Orders', callback_data: 'my_orders' },
            { text: '🎂 New Request', callback_data: 'wiz_start' },
          ],
        ],
      };
    }

    await ctx.reply(msg, replyOptions);
    return;
  }

  const user = await usersService.findByTelegramId(telegramId);

  if (user) {
    await ctx.reply(
      `Welcome back, <b>${escapeHtml(user.name)}</b>! 🎂\n\n` +
        `I'm Yodit's Cake Helper, your Flavour Bites assistant.\n\n` +
        `<b>What I can do:</b>\n` +
        `• /status — check your current orders\n` +
        `• /order — start a new cake request\n` +
        `• /help — see all commands`,
      { parse_mode: 'HTML' }
    );
  } else {
    await ctx.reply(
      `Hello! 👋 I'm <b>Yodit's Apprentice</b>, the bot for <b>Flavour Bites</b> — a custom cake boutique in ${BUSINESS_INFO.location.area}, ${BUSINESS_INFO.location.city}.\n\n` +
        `To use me fully, you'll need to link your account. Visit our website and sign in with Telegram:\n` +
        `👉 <b>${getWebsiteHtmlLink()}</b>\n\n` +
        `Once linked, you can check your order status and get updates right here.`,
      { parse_mode: 'HTML' }
    );
  }
}
