import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { clientEnvSchema } from './src/client/platform/config/envSchema';

function assertFrontendEnv(mode: string): void {
  const loaded = loadEnv(mode, process.cwd(), '');
  const result = clientEnvSchema.safeParse(loaded);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `Invalid frontend environment:\n${issues}\n` +
        'Set the required VITE_* variables before building the client (see .env.example).'
    );
  }
}

export default defineConfig(({ mode }) => {
  // Fail the build (and the dev-server start) when required client env vars are missing.
  assertFrontendEnv(mode);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@client': path.resolve(__dirname, './src/client'),
        '@server': path.resolve(__dirname, './src/server'),
        '@shared': path.resolve(__dirname, './src/shared'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
