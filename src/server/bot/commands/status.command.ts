import { CommandContext, Context } from 'grammy';
import { getPrisma } from '../../platform/config/prisma';
import { STATUS_EMOJI } from '../../../shared/constants/orderStatus';

export async function handleStatusCommand(ctx: CommandContext<Context>): Promise<void> {
  const telegramId = String(ctx.from?.id);
  const prisma = getPrisma();

  const user = await prisma.user.findFirst({
    where: { telegramId, deletedAt: null },
    include: {
      requests: {
        where: {
          status: { notIn: ['Completed', 'Cancelled'] },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!user) {
    await ctx.reply(
      "⚠️ Your Telegram account isn't linked yet.\n\nVisit <b>flavourbites.com</b> and sign in with Telegram to link your account.",
      { parse_mode: 'HTML' }
    );
    return;
  }

  if (user.requests.length === 0) {
    await ctx.reply(
      `Hi <b>${user.name}</b>! You have no active orders right now.\n\nUse /order to start a new cake request. 🎂`,
      { parse_mode: 'HTML' }
    );
    return;
  }

  const lines = user.requests.map((r, i) => {
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
