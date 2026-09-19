import { Request, Response } from 'express';
import { getPrisma, env } from '../../platform/config/index';

export const healthController = {
  getHealth: async (_req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      const prisma = getPrisma();
      await prisma.$queryRaw`SELECT 1`;
      const latencyMs = Date.now() - startTime;

      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        environment: env.NODE_ENV,
        services: {
          database: {
            status: 'connected',
            latencyMs,
          },
        },
      });
    } catch (err: any) {
      res.status(503).json({
        status: 'degraded',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        environment: env.NODE_ENV,
        services: {
          database: {
            status: 'disconnected',
            error: err?.message || 'Database query failed',
          },
        },
      });
    }
  },
};
