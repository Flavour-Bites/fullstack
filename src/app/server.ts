import 'dotenv/config';
import { validateEnv } from './config/env.js';
import { createApp, registerWebhook } from './app.js';
import { getPrisma } from './config/prisma.js';

validateEnv();

const PORT = Number(process.env.PORT || 3000);
const SHUTDOWN_TIMEOUT_MS = 10_000;

async function start() {
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

    // Force exit if graceful shutdown takes too long
    setTimeout(() => {
      console.error(`[Server] Forced shutdown after ${SHUTDOWN_TIMEOUT_MS}ms timeout.`);
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
