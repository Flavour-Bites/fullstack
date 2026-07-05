import { Request, Response } from 'express';
import { uploadsService } from './uploads.service.js';
import { asyncHandler } from '../../app/middleware/asyncHandler.js';

export const uploadsController = {
  uploadImage: asyncHandler(async (req: Request, res: Response) => {
    const image = await uploadsService.uploadImage(req.body);
    res.json({ success: true, image });
  }),

  deleteImage: asyncHandler(async (req: Request, res: Response) => {
    await uploadsService.deleteImage(req.body.publicId);
    res.json({ success: true });
  }),
};
