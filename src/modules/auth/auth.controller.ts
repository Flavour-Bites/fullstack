import { Request, Response } from 'express';
import { authService } from './auth.service.js';
import { asyncHandler } from '../../app/middleware/asyncHandler.js';

export const authController = {
  initiateTelegramLogin: asyncHandler(async (req: Request, res: Response) => {
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:3000';
    const baseUrl = process.env.APP_URL || `${protocol}://${host}`;
    const redirectUri = `${baseUrl}/api/auth/telegram/callback`;

    const { authorizationUrl, state, nonce, codeVerifier } = await authService.initiateOidcFlow(redirectUri);

    const tempCookieOptions = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 1000, // 10 minutes
      path: '/',
    };

    res.cookie('oidc_state', state, tempCookieOptions);
    res.cookie('oidc_nonce', nonce, tempCookieOptions);
    res.cookie('oidc_code_verifier', codeVerifier, tempCookieOptions);

    if (req.headers.accept?.includes('application/json') || req.xhr) {
      res.json({ success: true, authorizationUrl });
    } else {
      res.redirect(authorizationUrl);
    }
  }),

  handleTelegramCallback: asyncHandler(async (req: Request, res: Response) => {
    const code = (req.query.code || req.body?.code) as string;
    const state = (req.query.state || req.body?.state) as string;

    const storedState = req.cookies?.oidc_state;
    const storedNonce = req.cookies?.oidc_nonce;
    const codeVerifier = req.cookies?.oidc_code_verifier;

    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:3000';
    const baseUrl = process.env.APP_URL || `${protocol}://${host}`;
    const redirectUri = `${baseUrl}/api/auth/telegram/callback`;

    const result = await authService.handleOidcCallback({
      code,
      state,
      storedState,
      storedNonce,
      codeVerifier,
      redirectUri,
    });

    res.clearCookie('oidc_state', { path: '/' });
    res.clearCookie('oidc_nonce', { path: '/' });
    res.clearCookie('oidc_code_verifier', { path: '/' });

    if (result.token) {
      res.cookie('auth_token', result.token, authService.authCookieOptions);
    }

    if (req.method === 'GET') {
      const redirectTarget = result.needsPassword ? '/auth?needsPassword=true' : '/';
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
};
