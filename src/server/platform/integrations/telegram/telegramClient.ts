import { fetchWithTimeout } from '../../../../shared/utils/fetchWithTimeout';
import { env } from '../../config/env';

function getBaseUrl(): string {
  return `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}`;
}

export interface InlineButton {
  text: string;
  callback_data?: string;
  url?: string;
  web_app?: { url: string };
}

export type InlineKeyboard = InlineButton[][];

async function callTelegram(method: string, body: object): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${getBaseUrl()}/${method}`, {
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

export async function editMessageReplyMarkup(
  chatId: string | number,
  messageId: number,
  buttons?: InlineKeyboard
): Promise<boolean> {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: { inline_keyboard: buttons ?? [] },
  };

  return callTelegram('editMessageReplyMarkup', body);
}

export async function sendChatAction(
  chatId: string | number,
  action: 'typing' | 'upload_photo' | 'choose_sticker' | 'find_location' = 'typing'
): Promise<boolean> {
  return callTelegram('sendChatAction', {
    chat_id: chatId,
    action,
  });
}

export async function sendPhoto(
  chatId: string | number,
  photo: string,
  caption?: string,
  buttons?: InlineKeyboard
): Promise<boolean> {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    photo,
    parse_mode: 'HTML',
  };

  if (caption) {
    body.caption = caption;
  }

  if (buttons && buttons.length > 0) {
    body.reply_markup = { inline_keyboard: buttons };
  }

  return callTelegram('sendPhoto', body);
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

export async function setMyCommands(
  commands: Array<{ command: string; description: string }>
): Promise<boolean> {
  return callTelegram('setMyCommands', { commands });
}

export async function setChatMenuButton(
  menuButton?: { type: string; text?: string; web_app?: { url: string } }
): Promise<boolean> {
  return callTelegram('setChatMenuButton', {
    menu_button: menuButton ?? { type: 'default' },
  });
}

export async function setWebhook(
  url: string,
  secretToken?: string
): Promise<boolean> {
  const body: Record<string, unknown> = { url };
  if (secretToken) body.secret_token = secretToken;
  return callTelegram('setWebhook', body);
}

export async function deleteWebhook(
  dropPendingUpdates = false
): Promise<boolean> {
  return callTelegram('deleteWebhook', {
    drop_pending_updates: dropPendingUpdates,
  });
}
