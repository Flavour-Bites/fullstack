import { GoogleGenAI } from '@google/genai';
import { env } from '../../app/config/env.js';

let aiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY is not configured.');
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}
