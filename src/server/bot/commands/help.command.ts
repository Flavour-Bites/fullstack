import { CommandContext, Context } from 'grammy';

export async function handleHelpCommand(ctx: CommandContext<Context>): Promise<void> {
  await ctx.reply(
    `<b>Flavour Bites Bot — Commands</b>\n\n` +
      `/start — Welcome message\n` +
      `/status — Check your active orders\n` +
      `/order — Start a new cake request\n` +
      `/help — This message\n\n` +
      `For questions, visit <b>flavourbites.com</b> or call us directly.`,
    { parse_mode: 'HTML' }
  );
}
