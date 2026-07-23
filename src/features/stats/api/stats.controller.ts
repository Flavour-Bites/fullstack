import { Request, Response } from 'express';
import { statsService } from './stats.service';
import { asyncHandler } from '../../../app/middleware/asyncHandler';

export const statsController = {
  getStats: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await statsService.getStats();
    res.json({ success: true, stats });
  }),
};
