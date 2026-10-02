import { clientEnvSchema, type ClientEnv } from './envSchema';

function loadClientEnv(): ClientEnv {
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

export const env: Readonly<ClientEnv> = loadClientEnv();