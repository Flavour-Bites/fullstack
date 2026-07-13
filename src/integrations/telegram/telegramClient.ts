import { fetchWithTimeout } from '../../shared/utils/fetchWithTimeout.js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

export interface InlineButton {
  text: string;
  callback_data: string;
}

export type InlineKeyboard = InlineButton[][];

async function callTelegram(method: string, body: object): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${BASE_URL}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }, 10_000);
    const data = await res.json() as { ok: boolean; description?: string };
    if (!data.ok) {
      console.error(`[Telegram] ${method} failed:`, data.description);
    }
    return data.ok;
  } catch (err) {
    console.error(`[Telegram] Network error calling ${method}:`, err);
    return false;
  }
}

export async function sendMessage(
  chatId: string | number,
  text: string,
  buttons?: InlineKeyboard
): Promise<boolean> {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
  };

  if (buttons && buttons.length > 0) {
    body.reply_markup = { inline_keyboard: buttons };
  }

  return callTelegram('sendMessage', body);
}

export async function editMessage(
  chatId: string | number,
  messageId: number,
  text: string,
  buttons?: InlineKeyboard
): Promise<boolean> {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: 'HTML',
  };

  if (buttons) {
    body.reply_markup = { inline_keyboard: buttons };
  } else {
    body.reply_markup = { inline_keyboard: [] };
  }

  return callTelegram('editMessageText', body);
}

export async function answerCallback(
  callbackQueryId: string,
  text?: string
): Promise<boolean> {
  return callTelegram('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    text: text ?? '',
  });
}
