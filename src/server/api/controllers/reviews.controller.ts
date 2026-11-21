import { Request, Response } from 'express';
import { reviewsService } from '../../modules/reviews/reviews.service';
import { asyncHandler } from '../../platform/middleware/asyncHandler';

export const reviewsController = {
  findAll: asyncHandler(async (_req: Request, res: Response) => {
    const reviews = await reviewsService.findAll();
    res.json({ success: true, reviews });
  }),

  findByProduct: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const reviews = await reviewsService.findByProductId(id);
    res.json({ success: true, reviews });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const review = await reviewsService.create(req.body, req.user!.userId);
    res.json({ success: true, review });
  }),

  createForProduct: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const review = await reviewsService.create({ ...req.body, productId: id }, req.user!.userId);
    res.json({ success: true, review });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await reviewsService.delete(req.params.id);
    res.json({ success: true });
  }),
};
