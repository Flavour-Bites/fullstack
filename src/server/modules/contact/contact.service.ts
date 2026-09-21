import { sendMessage } from '@server/platform/integrations/telegram/telegramClient.js';
import { getStaffChatIds } from '@server/platform/integrations/telegram/telegramNotifications.js';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
    await Promise.allSettled(staffIds.map((id) => sendMessage(id, text)));

    return { delivered: staffIds.length > 0 };
  },
};