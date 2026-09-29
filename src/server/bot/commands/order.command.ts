import { CommandContext, Context } from 'grammy';
import { getPrisma } from '../../platform/config/prisma';
import { getConversationStore } from '../../platform/integrations/redis/conversationState';
import { businessAvailabilityService } from '../../modules/business/businessAvailability.service';
import type { OrderConversation } from '../types';

const conversationStore = getConversationStore();

export async function handleOrderCommand(ctx: CommandContext<Context>): Promise<void> {
  const telegramId = String(ctx.from?.id);
  const prisma = getPrisma();

  const user = await prisma.user.findFirst({ where: { telegramId, deletedAt: null } });

  if (!user) {
    await ctx.reply(
      "⚠️ Your Telegram account isn't linked yet.\n\nVisit <b>flavourbites.com</b> and sign in with Telegram to link your account.",
      { parse_mode: 'HTML' }
    );
    return;
  }

  // Fetch availability policy
  const availability = await businessAvailabilityService.getAvailabilityResponse();

  if (!availability.isEnabled) {
    await ctx.reply(
      '⚠️ Ordering is currently disabled. Please check back later.',
      { parse_mode: 'HTML' }
    );
    return;
  }

  const availableDays = Object.entries(availability.days)
    .filter(([, enabled]) => enabled)
    .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1))
    .join(', ');

  if (availableDays.length === 0) {
    await ctx.reply(
      '⚠️ No days are currently available for orders. Please check back later.',
      { parse_mode: 'HTML' }
    );
    return;
  }

  const hours = availability.minimumLeadTimeHours;

  const conv: OrderConversation = {
    step: 'eventType',
    userId: user.id,
    contactName: user.name,
    contactPhone: user.telegramPhone || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await conversationStore.setOrder(telegramId, conv);

  await ctx.reply(
    `🎂 <b>Let's make your cake!</b>\n\n` +
      `I'll ask you a few simple questions.\n\n` +
      `📅 <b>Available days:</b> ${availableDays}\n` +
      `⏱️ <b>Minimum notice:</b> ${hours} hours\n\n` +
      `<b>1.</b> What type of event is this?\n` +
      `(e.g., Birthday, Wedding, Anniversary, etc.)`,
    { parse_mode: 'HTML' }
  );
}
