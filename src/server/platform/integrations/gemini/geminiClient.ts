import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env';

let aiClient: GoogleGenAI | null = null;

export function isGeminiConfigured(): boolean {
  return Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0);
}

export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = env.GEMINI_API_KEY;
    if (!key || key.trim().length === 0) throw new Error('GEMINI_API_KEY is not configured.');
    aiClient = new GoogleGenAI({ apiKey: key.trim() });
  }
  return aiClient;
}
