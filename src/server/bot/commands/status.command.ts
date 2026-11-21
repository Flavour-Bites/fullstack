import { CommandContext, Context } from 'grammy';
import { usersService } from '../../modules/users/users.service';
import { ordersService } from '../../modules/orders/orders.service';
import { STATUS_EMOJI } from '../../../shared/constants/orderStatus';
import { getWebsiteHtmlLink } from '../botHelpers';

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
      `Hi <b>${user.name}</b>! You have no active orders right now.\n\nUse /order to start a new cake request. 🎂`,
      { parse_mode: 'HTML' }
    );
    return;
  }

  const lines = activeOrders.map((r, i) => {
    const emoji = STATUS_EMOJI[r.status] ?? '📦';
    return (
      `<b>${i + 1}. ${r.eventType} Cake</b>\n` +
      `   ${emoji} ${r.status}\n` +
      `   📅 ${r.eventDate}\n` +
      `   🆔 <code>${r.id}</code>`
    );
  });

  await ctx.reply(
    `Hi <b>${user.name}</b>! Here are your active orders:\n\n${lines.join('\n\n')}`,
    { parse_mode: 'HTML' }
  );
}
