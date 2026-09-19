import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrisma = {
  $queryRaw: vi.fn(),
};

vi.mock('@server/platform/config/index', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    getPrisma: vi.fn(() => mockPrisma),
  };
});

import { healthController } from '@server/api/controllers/health.controller';

function mockReq() {
  return {} as any;
}

function mockRes() {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe('healthController.getHealth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 and healthy status when database is reachable', async () => {
    mockPrisma.$queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);
    const req = mockReq();
    const res = mockRes();

    await healthController.getHealth(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        services: expect.objectContaining({
          database: expect.objectContaining({
            status: 'connected',
            latencyMs: expect.any(Number),
          }),
        }),
      })
    );
  });

  it('returns 503 and degraded status when database is unreachable', async () => {
    mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('Connection refused'));
    const req = mockReq();
    const res = mockRes();

    await healthController.getHealth(req, res);

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'degraded',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        services: expect.objectContaining({
          database: expect.objectContaining({
            status: 'disconnected',
            error: 'Connection refused',
          }),
        }),
      })
    );
  });
});
