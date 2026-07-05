import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.hoisted(() => {
  process.env.TELEGRAM_BOT_TOKEN = 'test_bot_token';
});

import { sendMessage, editMessage, answerCallback } from '../telegramClient.js';

const BOT_TOKEN = 'test_bot_token';
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

describe('Telegram API', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  describe('sendMessage', () => {
    it('sends a message to the Telegram API', async () => {
      (global.fetch as any).mockResolvedValue({
        json: () => Promise.resolve({ ok: true }),
      });

      const result = await sendMessage('12345', 'Hello world');
      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE_URL}/sendMessage`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"chat_id":"12345"'),
        })
      );
    });

    it('includes parse_mode HTML', async () => {
      (global.fetch as any).mockResolvedValue({
        json: () => Promise.resolve({ ok: true }),
      });

      await sendMessage('12345', '<b>bold</b>');
      const call = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(call.parse_mode).toBe('HTML');
    });

    it('includes inline keyboard when buttons provided', async () => {
      (global.fetch as any).mockResolvedValue({
        json: () => Promise.resolve({ ok: true }),
      });

      const buttons = [[{ text: 'Yes', callback_data: 'confirm:1' }]];
      await sendMessage('12345', 'Choose:', buttons);
      const call = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(call.reply_markup.inline_keyboard).toEqual(buttons);
    });

    it('returns false on API failure', async () => {
      (global.fetch as any).mockResolvedValue({
        json: () => Promise.resolve({ ok: false, description: 'Bad Request' }),
      });

      const result = await sendMessage('12345', 'test');
      expect(result).toBe(false);
    });

    it('returns false on network error', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));
      const result = await sendMessage('12345', 'test');
      expect(result).toBe(false);
    });

    it('works with numeric chat_id', async () => {
      (global.fetch as any).mockResolvedValue({
        json: () => Promise.resolve({ ok: true }),
      });

      await sendMessage(67890, 'Hello');
      const call = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(call.chat_id).toBe(67890);
    });
  });

  describe('editMessage', () => {
    it('sends editMessageText with message_id', async () => {
      (global.fetch as any).mockResolvedValue({
        json: () => Promise.resolve({ ok: true }),
      });

      const result = await editMessage('12345', 42, 'Updated text');
      expect(result).toBe(true);
      const call = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(call.chat_id).toBe('12345');
      expect(call.message_id).toBe(42);
      expect(call.text).toBe('Updated text');
    });

    it('sends empty keyboard when no buttons', async () => {
      (global.fetch as any).mockResolvedValue({
        json: () => Promise.resolve({ ok: true }),
      });

      await editMessage('12345', 1, 'No buttons');
      const call = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(call.reply_markup.inline_keyboard).toEqual([]);
    });

    it('includes buttons when provided', async () => {
      (global.fetch as any).mockResolvedValue({
        json: () => Promise.resolve({ ok: true }),
      });

      const buttons = [[{ text: 'OK', callback_data: 'ok' }]];
      await editMessage('12345', 1, 'With buttons', buttons);
      const call = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(call.reply_markup.inline_keyboard).toEqual(buttons);
    });
  });

  describe('answerCallback', () => {
    it('sends answerCallbackQuery with callback_query_id', async () => {
      (global.fetch as any).mockResolvedValue({
        json: () => Promise.resolve({ ok: true }),
      });

      const result = await answerCallback('callback_123');
      expect(result).toBe(true);
      const call = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(call.callback_query_id).toBe('callback_123');
    });

    it('includes text when provided', async () => {
      (global.fetch as any).mockResolvedValue({
        json: () => Promise.resolve({ ok: true }),
      });

      await answerCallback('cb_456', 'Order updated!');
      const call = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(call.text).toBe('Order updated!');
    });

    it('sends empty text when not provided', async () => {
      (global.fetch as any).mockResolvedValue({
        json: () => Promise.resolve({ ok: true }),
      });

      await answerCallback('cb_789');
      const call = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(call.text).toBe('');
    });
  });
});
