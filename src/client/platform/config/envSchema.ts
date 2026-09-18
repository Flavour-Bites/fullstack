import { z } from 'zod';

/**
 * Client environment variables.
 *
 * Only variables prefixed with VITE_ are exposed by Vite at build time and
 * frozen into the bundle via import.meta.env. Every entry is required:
 * no fallbacks. A variable not present in the environment fails both the
 * build (see vite.config.ts) and app startup (see env.ts).
 */
export const clientEnvSchema = z.object({
  VITE_API_URL: z
    .string({ error: 'VITE_API_URL is required' })
    .url(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;