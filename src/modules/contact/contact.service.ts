import { sendMessage } from '../../integrations/telegram/telegramClient.js';
import { getPrisma } from '../../app/config/prisma.js';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function getStaffChatIds(): Promise<string[]> {
  try {
    const prisma = getPrisma();
    const staff = await prisma.user.findMany({
      where: {
        role: { in: ['admin', 'staff'] },
        notifyViaTelegram: true,
        telegramId: { not: '' },
        deletedAt: null,
      },
      select: { telegramId: true },
    });
    return staff.map((u) => u.telegramId);
  } catch {
    return [];
  }
}

export const contactService = {
  async submitContact(data: { name: string; email: string; subject: string; message: string }) {
    const text = [
      `<b>📬 New Contact Form Message</b>`,
      '',
      `<b>From:</b> ${escapeHtml(data.name)}`,
      `<b>Email:</b> ${escapeHtml(data.email)}`,
      `<b>Subject:</b> ${escapeHtml(data.subject)}`,
      '',
      `<b>Message:</b>`,
      escapeHtml(data.message),
    ].join('\n');

    const staffIds = await getStaffChatIds();
    for (const id of staffIds) {
      await sendMessage(id, text);
    }

    return { delivered: staffIds.length > 0 };
  },
};