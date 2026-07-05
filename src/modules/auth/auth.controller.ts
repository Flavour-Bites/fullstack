import { Request, Response } from 'express';
import { authService } from './auth.service.js';
import { authLimiter } from '../../app/config/rateLimiter.js';
import { asyncHandler } from '../../app/middleware/asyncHandler.js';

export const authController = {
  telegramLogin: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.telegramLogin(req.body);
    if (result.token) {
      res.cookie('auth_token', result.token, authService.authCookieOptions);
    }
    res.json(result);
  }),

  finalizeTelegram: asyncHandler(async (req: Request, res: Response) => {
    const { telegramId, password } = req.body;
    const result = await authService.finalizeTelegramLogin(telegramId, password);
    if (result.token) {
      res.cookie('auth_token', result.token, authService.authCookieOptions);
    }
    res.json(result);
  }),

  setPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.setPassword(req.user!.userId, req.body.password);
    res.json({ success: true });
  }),

  verifyPassword: asyncHandler(async (req: Request, res: Response) => {
    const valid = await authService.verifyUserPassword(req.user!.userId, req.body.password);
    res.json({ success: true, valid });
  }),

  telegramPasswordLogin: asyncHandler(async (req: Request, res: Response) => {
    const { telegramId, password } = req.body;
    const result = await authService.telegramPasswordLogin(telegramId, password);
    if (result.token) {
      res.cookie('auth_token', result.token, authService.authCookieOptions);
    }
    res.json(result);
  }),

  logout: asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie('auth_token');
    res.json({ success: true });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getCurrentUser(req.user!.userId);
    res.json({ success: true, user });
  }),
};
