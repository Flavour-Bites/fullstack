import { getGeminiClient } from '../../platform/integrations/gemini/geminiClient';

export const chatbotService = {
  async chat(messages: Array<{ role: string; text: string }>) {
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    const response = await getGeminiClient().models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
      config: {
        temperature: 0.7,
        systemInstruction:
          'You are a helpful bakery assistant for Flavour Bites in Addis Ababa. Use simple English, short sentences, and friendly wording. Say "cake price" instead of "quotation". We only offer studio pickup at our location in Addis Ababa (we do not offer delivery). Our custom celebration cakes are handcrafted by head baker Yodit.',
      },
    });

    return response.text;
  },
};
