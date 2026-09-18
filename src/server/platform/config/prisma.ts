import { PrismaClient } from '@prisma/client';
import { env } from './env';

let prismaInstance: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      datasources: {
        db: { url: env.DATABASE_URL },
      },
    });
  }
  return prismaInstance;
}
