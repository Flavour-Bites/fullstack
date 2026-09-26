import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@client': path.resolve(__dirname, './src/client'),
      '@server': path.resolve(__dirname, './src/server'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@test': path.resolve(__dirname, './test'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    // Seed import.meta.env for client tests. VITE_API_URL is required by the
    // client env schema; providing it here (instead of relying on a .env or
    // the host build environment) keeps tests hermetic on any runner/CI.
    env: {
      VITE_API_URL: 'http://localhost:3000',
    },
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'test/**/*.test.ts', 'test/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
    },
    setupFiles: ['test/setup.ts'],
  },
});
