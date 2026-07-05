import { Request, Response } from 'express';
import { reviewsService } from './reviews.service.js';
import { asyncHandler } from '../../app/middleware/asyncHandler.js';

export const reviewsController = {
  findAll: asyncHandler(async (_req: Request, res: Response) => {
    const reviews = await reviewsService.findAll();
    res.json({ success: true, reviews });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewsService.create(req.body, req.user!.userId);
    res.json({ success: true, review });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await reviewsService.delete(req.params.id);
    res.json({ success: true });
  }),
};
