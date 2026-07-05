import { sendMessage } from '../../integrations/telegram/telegramClient.js';
import { getPrisma } from '../../app/config/prisma.js';

async function getStaffChatIds(): Promise<string[]> {
  try {
    const prisma = getPrisma();
    const staff = await prisma.user.findMany({
      where: {
        role: { in: ['admin', 'staff'] },
        notifyViaTelegram: true,
        telegramId: { not: '' },
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
      `<b>From:</b> ${data.name}`,
      `<b>Email:</b> ${data.email}`,
      `<b>Subject:</b> ${data.subject}`,
      '',
      `<b>Message:</b>`,
      data.message,
    ].join('\n');

    const staffIds = await getStaffChatIds();
    for (const id of staffIds) {
      await sendMessage(id, text);
    }

    return { delivered: staffIds.length > 0 };
  },
};