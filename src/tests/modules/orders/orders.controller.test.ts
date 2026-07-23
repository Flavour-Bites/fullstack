import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/modules/orders/orders.service.js', () => ({
  ordersService: {
    findById: vi.fn(),
    restore: vi.fn(),
    findAll: vi.fn(),
    create: vi.fn(),
    updateCommercials: vi.fn(),
    updateDesignAndNotes: vi.fn(),
    changeStatus: vi.fn(),
    acceptPrice: vi.fn(),
    softDelete: vi.fn(),
    getTimeline: vi.fn(),
    updateAll: vi.fn(),
  },
}));

vi.mock('@/app/middleware/asyncHandler.js', () => ({
  asyncHandler: (fn: Function) => fn,
}));

vi.mock('@/modules/orders/orders.workflow.js', () => ({
  isValidTransition: vi.fn(() => true),
}));

import { ordersController } from '@/modules/orders/orders.controller.js';
import { ordersService } from '@/modules/orders/orders.service.js';

const mockFindById = vi.mocked(ordersService.findById);
const mockRestore = vi.mocked(ordersService.restore);
const mockSoftDelete = vi.mocked(ordersService.softDelete);

function createReq(params: Record<string, string> = {}) {
  return {
    params,
    query: {},
    body: {},
    user: { userId: 'usr_admin', role: 'admin' },
  } as any;
}

function createRes() {
  let statusCode = 200;
  let jsonBody: any = null;
  const res: any = {
    status: (code: number) => { statusCode = code; return res; },
    json: (body: any) => { jsonBody = body; },
  };
  Object.defineProperty(res, 'statusCode', { get: () => statusCode });
  Object.defineProperty(res, 'jsonBody', { get: () => jsonBody });
  return res;
}

describe('ordersController.restore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 404 when order does not exist', async () => {
    mockFindById.mockResolvedValue(null);
    const res = createRes();

    await ordersController.restore(createReq({ id: 'FB-NONEXISTENT' }), res, vi.fn());

    expect(res.statusCode).toBe(404);
    expect(res.jsonBody).toEqual({ success: false, error: 'Order not found.' });
    expect(mockRestore).not.toHaveBeenCalled();
  });

  it('restores a deleted order (that is the purpose of restore)', async () => {
    mockFindById.mockResolvedValue({ id: 'FB-DELETED', deletedAt: new Date() } as any);
    mockRestore.mockResolvedValue({ id: 'FB-DELETED', deletedAt: null } as any);
    const res = createRes();

    await ordersController.restore(createReq({ id: 'FB-DELETED' }), res, vi.fn());

    expect(res.statusCode).toBe(200);
    expect(res.jsonBody.success).toBe(true);
    expect(mockRestore).toHaveBeenCalledWith('FB-DELETED');
  });

  it('restores the order when found and not deleted', async () => {
    mockFindById.mockResolvedValue({ id: 'FB-123', deletedAt: null } as any);
    mockRestore.mockResolvedValue({ id: 'FB-123', deletedAt: null } as any);
    const res = createRes();

    await ordersController.restore(createReq({ id: 'FB-123' }), res, vi.fn());

    expect(res.statusCode).toBe(200);
    expect(res.jsonBody.success).toBe(true);
    expect(res.jsonBody.request.deletedAt).toBeNull();
    expect(mockRestore).toHaveBeenCalledWith('FB-123');
  });
});

describe('ordersController.softDelete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 404 when order does not exist', async () => {
    mockFindById.mockResolvedValue(null);
    const res = createRes();

    await ordersController.softDelete(createReq({ id: 'FB-NONEXISTENT' }), res, vi.fn());

    expect(res.statusCode).toBe(404);
    expect(res.jsonBody).toEqual({ success: false, error: 'Order not found.' });
  });

  it('returns 404 when order is already deleted', async () => {
    mockFindById.mockResolvedValue({ id: 'FB-123', deletedAt: new Date() } as any);
    const res = createRes();

    await ordersController.softDelete(createReq({ id: 'FB-123' }), res, vi.fn());

    expect(res.statusCode).toBe(404);
  });

  it('soft deletes an existing non-deleted order', async () => {
    mockFindById.mockResolvedValue({ id: 'FB-123', deletedAt: null } as any);
    mockSoftDelete.mockResolvedValue({ id: 'FB-123', deletedAt: new Date() } as any);
    const res = createRes();

    await ordersController.softDelete(createReq({ id: 'FB-123' }), res, vi.fn());

    expect(res.statusCode).toBe(200);
    expect(res.jsonBody.success).toBe(true);
    expect(mockSoftDelete).toHaveBeenCalledWith('FB-123');
  });
});
