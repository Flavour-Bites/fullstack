import { Request, Response } from 'express';
import { authService } from '../../modules/auth/auth.service';
import { asyncHandler } from '../../platform/middleware/asyncHandler';
import { env, isLocalhostUrl } from '../../platform/config/env';

export function getTelegramRedirectUri(req: Request): string {
  const forwardedHost = req.get('x-forwarded-host');
  const host = forwardedHost || req.get('host');
  const proto = req.get('x-forwarded-proto') || (req.secure ? 'https' : (req.protocol || 'https'));

  if (host && !isLocalhostUrl(`http://${host}`)) {
    return `${proto}://${host}/api/auth/telegram/callback`;
  }

  return `${env.APP_URL}/api/auth/telegram/callback`;
}

export const authController = {
  initiateTelegramLogin: asyncHandler(async (req: Request, res: Response) => {
    const redirectUri = getTelegramRedirectUri(req);

    const { authorizationUrl } = await authService.initiateOidcFlow(redirectUri);

    if (req.headers.accept?.includes('application/json') || req.xhr) {
      res.json({ success: true, authorizationUrl });
    } else {
      res.redirect(authorizationUrl);
    }
  }),

  handleTelegramCallback: asyncHandler(async (req: Request, res: Response) => {
    const code = (req.query.code || req.body?.code) as string;
    const state = (req.query.state || req.body?.state) as string;
    const redirectUri = getTelegramRedirectUri(req);

    const result = await authService.handleOidcCallback({
      code,
      state,
      redirectUri,
    });

    if (result.token) {
      res.cookie('auth_token', result.token, authService.authCookieOptions);
    }

    if (req.method === 'GET') {
      const frontendBase = env.FRONTEND_URL.replace(/\/+$/, '');
      const redirectTarget = result.needsPassword
        ? `${frontendBase}/auth?needsPassword=true`
        : `${frontendBase}/`;
      res.redirect(redirectTarget);
    } else {
      res.json(result);
    }
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

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.updateProfile(req.user!.userId, req.body);
    res.json({ success: true, user });
  }),
};
