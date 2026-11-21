import { z } from 'zod';

/**
 * Client environment variables.
 *
 * Only variables prefixed with VITE_ are exposed by Vite at build time and
 * frozen into the bundle via import.meta.env. Every entry is required and
 * has no runtime fallback: a missing or invalid variable fails the build
 * (see vite.config.ts) and app startup (see env.ts).
 *
 * VITE_API_URL is the absolute URL of the separately-deployed backend (Render).
 * Vercel supplies it during its `vite build`; the built SPA ONLY talks to that
 * origin. There is no same-origin default — if the backend is down the client
 * reports it as a normal API failure.
 */
export const clientEnvSchema = z.object({
  VITE_API_URL: z
    .string({ error: 'VITE_API_URL is required' })
    .url('VITE_API_URL must be a valid absolute URL'),

  // Optional social handles for branding (have sensible defaults)
  VITE_FLAVOURBITES_EMAIL: z.string().email().optional(),
  VITE_FLAVOURBITES_TELEGRAM_HANDLE: z.string().optional(),
  VITE_FLAVOURBITES_TELEGRAM_LINK: z.string().url().optional(),
  VITE_FLAVOURBITES_INSTAGRAM_HANDLE: z.string().optional(),
  VITE_FLAVOURBITES_INSTAGRAM_LINK: z.string().url().optional(),
  VITE_FLAVOURBITES_FACEBOOK_HANDLE: z.string().optional(),
  VITE_FLAVOURBITES_FACEBOOK_LINK: z.string().url().optional(),
  VITE_FLAVOURBITES_TWITTER_HANDLE: z.string().optional(),
  VITE_FLAVOURBITES_TWITTER_LINK: z.string().url().optional(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;