import { Request, Response } from 'express';
import { galleryService } from './gallery.service.js';
import { asyncHandler } from '../../app/middleware/asyncHandler.js';

export const galleryController = {
  findAll: asyncHandler(async (req: Request, res: Response) => {
    const categorySlug = typeof req.query.category === 'string' ? req.query.category : undefined;
    const items = await galleryService.findAll(categorySlug);
    res.json({ success: true, items });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const item = await galleryService.create(req.body);
    res.json({ success: true, item });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const item = await galleryService.update(req.params.id, req.body);
    res.json({ success: true, item });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await galleryService.delete(req.params.id);
    res.json({ success: true });
  }),
};
