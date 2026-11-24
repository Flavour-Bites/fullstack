import { CommandContext, Context } from 'grammy';
import { getWebsiteHtmlLink } from '../botHelpers';

export async function handleHelpCommand(ctx: CommandContext<Context>): Promise<void> {
  await ctx.reply(
    `<b>Flavour Bites Bot — Commands</b>\n\n` +
      `/start — Welcome message\n` +
      `/status — Check your active orders\n` +
      `/order — Start a new cake request\n` +
      `/cancel — Cancel your active request or prompt\n` +
      `/help — This message\n\n` +
      `For questions, visit ${getWebsiteHtmlLink()} or call us directly.`,
    { parse_mode: 'HTML' }
  );
}
