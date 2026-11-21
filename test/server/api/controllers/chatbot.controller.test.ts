import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@server/modules/chatbot/chatbot.service.js', () => ({
  chatbotService: {
    chat: vi.fn(),
  },
}));

vi.mock('@server/platform/middleware/asyncHandler.js', () => ({
  asyncHandler: (fn: Function) => fn,
}));

import { chatbotController } from '@server/api/controllers/chatbot.controller.js';
import { chatbotService } from '@server/modules/chatbot/chatbot.service.js';

const mockChat = vi.mocked(chatbotService.chat);

describe('chatbotController.chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to chatbotService.chat with messages and returns text', async () => {
    mockChat.mockResolvedValue('Hello! We offer vanilla and chocolate cakes.');

    const req = {
      body: {
        messages: [{ role: 'user', text: 'What cakes do you have?' }],
      },
    } as any;

    let jsonBody: any = null;
    const res = {
      json: (body: any) => {
        jsonBody = body;
      },
    } as any;

    await chatbotController.chat(req, res, vi.fn());

    expect(mockChat).toHaveBeenCalledWith([{ role: 'user', text: 'What cakes do you have?' }]);
    expect(jsonBody).toEqual({
      success: true,
      text: 'Hello! We offer vanilla and chocolate cakes.',
    });
  });
});

