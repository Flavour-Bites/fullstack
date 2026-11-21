import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@server/platform/integrations/gemini/geminiClient.js', () => ({
  isGeminiConfigured: vi.fn(),
  getGeminiClient: vi.fn(),
}));

import { chatbotService, getBakeryFallbackResponse } from '@server/modules/chatbot/chatbot.service.js';
import { isGeminiConfigured, getGeminiClient } from '@server/platform/integrations/gemini/geminiClient.js';

const mockIsConfigured = vi.mocked(isGeminiConfigured);
const mockGetClient = vi.mocked(getGeminiClient);

describe('chatbotService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns fallback flavor details when Gemini is not configured', async () => {
    mockIsConfigured.mockReturnValue(false);

    const reply = await chatbotService.chat([
      { role: 'user', text: 'Recommend unique flavor pairings' },
    ]);

    expect(reply).toContain('Madagascar Vanilla Bean');
    expect(reply).toContain('Rich Chocolate Ganache');
  });

  it('returns fallback price details when Gemini is not configured', async () => {
    mockIsConfigured.mockReturnValue(false);

    const reply = await chatbotService.chat([
      { role: 'user', text: 'What is the price of custom cakes?' },
    ]);

    expect(reply).toContain('4,500 ETB');
    expect(reply).toContain('Book Custom Cake');
  });

  it('returns fallback pickup location details when asking about location', async () => {
    mockIsConfigured.mockReturnValue(false);

    const reply = await chatbotService.chat([
      { role: 'user', text: 'Where is your studio located for pickup?' },
    ]);

    expect(reply).toContain('Haile Garment');
    expect(reply).toContain('we do not offer delivery');
  });

  it('gracefully uses fallback when Gemini API throws an error', async () => {
    mockIsConfigured.mockReturnValue(true);
    mockGetClient.mockReturnValue({
      models: {
        generateContent: vi.fn().mockRejectedValue(new Error('Quota exceeded')),
      },
    } as any);

    const reply = await chatbotService.chat([
      { role: 'user', text: 'Can I get a cake for Sunday?' },
    ]);

    expect(reply).toContain('48 to 72 hours');
  });

  it('returns Gemini response text when Gemini succeeds', async () => {
    mockIsConfigured.mockReturnValue(true);
    mockGetClient.mockReturnValue({
      models: {
        generateContent: vi.fn().mockResolvedValue({ text: 'Custom AI response from Gemini!' }),
      },
    } as any);

    const reply = await chatbotService.chat([
      { role: 'user', text: 'Hello!' },
    ]);

    expect(reply).toBe('Custom AI response from Gemini!');
  });
});

describe('getBakeryFallbackResponse', () => {
  it('handles dietary questions', () => {
    const res = getBakeryFallbackResponse('do you offer eggless or gluten free?');
    expect(res).toContain('eggless');
  });

  it('provides welcoming default for general greetings', () => {
    const res = getBakeryFallbackResponse('hi');
    expect(res).toContain('Selam');
  });
});

