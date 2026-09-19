import { clientEnvSchema, type ClientEnv } from './envSchema';

function loadClientEnv(): ClientEnv {
  // import.meta.env is statically replaced by Vite at build time, so this is
  // resolved exactly once, at module load, before any app code runs.
  const result = clientEnvSchema.safeParse(import.meta.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `Invalid frontend environment:\n${issues}\n` +
        'VITE_API_URL must be set in the build environment (Vercel project env vars) before building the client.'
    );
  }
  return Object.freeze(result.data) as ClientEnv;
}

/**
 * Strongly-typed, frozen client environment singleton.
 * Values are baked in at build time — never read at runtime.
 */
export const env: Readonly<ClientEnv> = loadClientEnv();