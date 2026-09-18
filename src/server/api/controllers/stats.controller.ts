import { Request, Response } from 'express';
import { statsService } from '../../modules/stats/stats.service';
import { asyncHandler } from '../../platform/middleware/asyncHandler';

export const statsController = {
  getStats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await statsService.getStats();
    res.json({ success: true, stats });
  }),
};
