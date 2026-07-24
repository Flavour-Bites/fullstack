import { Request, Response } from 'express';
import { categoriesService } from './categories.service';
import { asyncHandler } from '../../../app/middleware/asyncHandler';

export const categoriesController = {
  findAll: asyncHandler(async (req: Request, res: Response) => {
    const includeInactive = req.query.includeInactive === 'true';
    const categories = await categoriesService.findAll(includeInactive);
    res.json({ success: true, categories });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoriesService.create(req.body);
    res.json({ success: true, category });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoriesService.update(req.params.id, req.body);
    res.json({ success: true, category });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await categoriesService.delete(req.params.id);
    res.json({ success: true, category: null });
  }),
};
