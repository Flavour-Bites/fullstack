import { Request, Response } from 'express';
import { usersService } from './users.service.js';
import { asyncHandler } from '../../app/middleware/asyncHandler.js';

export const usersController = {
  findAll: asyncHandler(async (_req: Request, res: Response) => {
    const users = await usersService.findAll();
    res.json({ success: true, users });
  }),

  updateRole: asyncHandler(async (req: Request, res: Response) => {
    const user = await usersService.updateRole(
      req.params.id,
      req.body.role,
      req.user!.userId,
    );
    res.json({ success: true, user });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await usersService.delete(req.params.id, req.user!.userId);
    res.json({ success: true });
  }),
};
