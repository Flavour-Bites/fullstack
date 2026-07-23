import { Request, Response } from 'express';
import { recoveryService } from './recovery.service';
import { asyncHandler } from '../../../app/middleware/asyncHandler';

export const recoveryController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const { oldTelegramId, newTelegramId } = req.body;
    const result = await recoveryService.create(oldTelegramId, newTelegramId);
    res.json({ success: true, ...result });
  }),

  findAll: asyncHandler(async (req: Request, res: Response) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const requests = await recoveryService.findAll(status);
    res.json({ success: true, requests });
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const request = await recoveryService.updateStatus(req.params.id, req.body.status);
    res.json({ success: true, request });
  }),
};
