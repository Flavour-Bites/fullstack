import { getGeminiClient, isGeminiConfigured } from '../../platform/integrations/gemini/geminiClient';

export function getBakeryFallbackResponse(prompt: string): string {
  const p = prompt.toLowerCase();

  if (p.includes('flavor') || p.includes('taste') || p.includes('pairing') || p.includes('ingredient')) {
    return '🍰 Our signature cake flavor pairings handcrafted by Chef Yodit include:\n\n• Madagascar Vanilla Bean with Salted Caramel\n• Rich Chocolate Ganache with Raspberry Compote\n• Lemon Zest Buttercream with Wild Berries\n\nAll recipes use 100% natural butter and no artificial stabilizers.';
  }

  if (p.includes('price') || p.includes('cost') || p.includes('how much') || p.includes('estimate') || p.includes('quotation')) {
    return '💰 Custom celebration cakes typically start around 4,500 ETB, depending on tier count, guest count, and handcrafted design intricacy.\n\nTo get your exact cake price, simply tap "Book Custom Cake" above and Yodit will review your specs personally!';
  }

  if (p.includes('date') || p.includes('advance') || p.includes('time') || p.includes('notice') || p.includes('lead') || p.includes('book') || p.includes('how far') || p.includes('soon') || p.includes('day') || p.includes('weekend')) {
    return '📅 We recommend booking at least 48 to 72 hours in advance. For weddings or elaborate multi-tier cakes, 1 to 2 weeks notice is best so Yodit can hand-sculpt your custom decorations.';
  }

  if (p.includes('pickup') || p.includes('location') || p.includes('where') || p.includes('address') || p.includes('deliver')) {
    return '📍 Flavour Bites operates exclusively for studio pickup at our Haile Garment studio in Nifas Silk-Lafto, Addis Ababa (we do not offer delivery). Pickup hours are Tuesday through Sunday, 9:00 AM – 6:00 PM.';
  }

  if (p.includes('egg') || p.includes('gluten') || p.includes('vegan') || p.includes('diet') || p.includes('allergy')) {
    return '🌱 Yes! We offer eggless and dairy-free options prepared with strictly isolated tools and surfaces. Please mention any dietary needs in the special instructions when placing your order.';
  }

  return 'Selam! I\'m Yodit\'s digital cake assistant for Flavour Bites. I can help with signature flavors, price estimates, booking lead times, and our studio pickup location in Garment. Feel free to ask, or tap "Book Custom Cake" to submit your request!';
}

export const chatbotService = {
  async chat(messages: Array<{ role: string; text: string }>): Promise<string> {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.text || '';

    if (isGeminiConfigured()) {
      try {
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

        if (response.text) {
          return response.text;
        }
      } catch (err) {
        console.warn('[ChatbotService] Gemini API call unavailable, using studio knowledge base fallback:', err);
      }
    }

    return getBakeryFallbackResponse(lastUserMessage);
  },
};
