import { CommandContext, Context } from 'grammy';
import { getPrisma } from '../../platform/config/prisma';
import { STATUS_EMOJI } from '../../../shared/constants/orderStatus';
import { BUSINESS_INFO } from '../../../shared/constants/business';

export async function handleStartCommand(ctx: CommandContext<Context>): Promise<void> {
  const telegramId = String(ctx.from?.id);
  const prisma = getPrisma();
  const payload = ctx.match?.toString().trim();

  if (payload?.startsWith('order_')) {
    const orderId = payload.slice(6);
    const order = await prisma.customCakeRequest.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      await ctx.reply(
        `⚠️ Order <code>${orderId}</code> not found.\n\nUse /start to see the welcome message.`,
        { parse_mode: 'HTML' }
      );
      return;
    }

    const emoji = STATUS_EMOJI[order.status] ?? '📦';

    let msg =
      `<b>🎂 Order #${order.id}</b>\n\n` +
      `${emoji} <b>Status:</b> ${order.status}\n` +
      `👤 <b>Customer:</b> ${order.contactName}\n` +
      `📞 <b>Phone:</b> ${order.contactPhone}\n` +
      `🎉 <b>Event:</b> ${order.eventType}\n` +
      `🍰 <b>Flavor:</b> ${order.flavor}\n` +
      `📅 <b>Event Date:</b> ${order.eventDate}\n` +
      `👥 <b>Guests:</b> ${order.guestCount}\n` +
      `🏗️ <b>Tiers:</b> ${order.tierCount}\n`;

    if (order.price) {
      msg += `💰 <b>Price:</b> ${order.price.toLocaleString()} ETB\n`;
    }

    await ctx.reply(msg, { parse_mode: 'HTML' });
    return;
  }

  const user = await prisma.user.findFirst({ where: { telegramId, deletedAt: null } });

  if (user) {
    await ctx.reply(
      `Welcome back, <b>${user.name}</b>! 🎂\n\n` +
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
        `<b>👉 flavourbites.com</b>\n\n` +
        `Once linked, you can check your order status and get updates right here.`,
      { parse_mode: 'HTML' }
    );
  }
}
