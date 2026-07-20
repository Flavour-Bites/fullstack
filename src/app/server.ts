import 'dotenv/config';
import { validateEnv } from './config/env.js';
import { createApp, registerWebhook } from './app.js';
import { getPrisma } from './config/prisma.js';

const PORT = Number(process.env.PORT || 3000);
const SHUTDOWN_TIMEOUT_MS = 10_000;
const DB_MAX_RETRIES = 5;
const DB_RETRY_DELAY_MS = 5_000;

async function checkDatabaseConnection(retries: number): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const prisma = getPrisma();
      await prisma.$queryRaw`SELECT 1`;
      console.log('[DB] Connected successfully.');
      return;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (attempt < retries) {
        console.warn(`[DB] Connection attempt ${attempt}/${retries} failed: ${msg}`);
        console.warn(`[DB] Retrying in ${DB_RETRY_DELAY_MS / 1000}s... (Neon cold start can take 15-30s)`);
        await new Promise((r) => setTimeout(r, DB_RETRY_DELAY_MS));
      } else {
        throw new Error(
          `[DB] Could not connect after ${retries} attempts.\n` +
          `[DB] Last error: ${msg}\n` +
          `[DB] Check your DATABASE_URL in .env and verify the Neon database is active.`
        );
      }
    }
  }
}

async function start() {
  validateEnv();

  console.log('[DB] Checking database connection...');
  await checkDatabaseConnection(DB_MAX_RETRIES);

  const app = await createApp();
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
  registerWebhook();

  const shutdown = async (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);

    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      try {
        await getPrisma().$disconnect();
        console.log('[Server] Prisma disconnected.');
      } catch {
        console.error('[Server] Error disconnecting Prisma.');
      }
      process.exit(0);
    });

    setTimeout(() => {
      console.error(`[Server] Forced shutdown after ${SHUTDOWN_TIMEOUT_MS}ms timeout.`);
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  console.error('\n========================================');
  console.error('  SERVER FAILED TO START');
  console.error('========================================');
  console.error(err.message || err);
  console.error('========================================\n');
  process.exit(1);
});
