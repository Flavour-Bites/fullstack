import { Request, Response } from 'express';
import { productsService } from '../../modules/products/products.service';
import { asyncHandler } from '../../platform/middleware/asyncHandler';

export const productsController = {
  findAll: asyncHandler(async (req: Request, res: Response) => {
    const categorySlug = typeof req.query.category === 'string' ? req.query.category : undefined;
    const includeInactive = req.query.includeInactive === 'true';
    const items = await productsService.findAll(categorySlug, includeInactive);
    res.json({ success: true, items });
  }),

  findById: asyncHandler(async (req: Request, res: Response) => {
    const item = await productsService.findById(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }
    res.json({ success: true, item });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const item = await productsService.create(req.body);
    res.json({ success: true, item });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const item = await productsService.update(req.params.id, req.body);
    res.json({ success: true, item });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await productsService.delete(req.params.id);
    res.json({ success: true });
  }),
};
