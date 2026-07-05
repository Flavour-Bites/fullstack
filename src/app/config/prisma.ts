import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is missing.');
  }

  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      datasources: {
        db: { url: dbUrl },
      },
    });
  }
  return prismaInstance;
}
