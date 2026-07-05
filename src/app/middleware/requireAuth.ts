import { Request, Response, NextFunction } from 'express';
import { verifyToken, getTokenFromRequest, TokenPayload } from '../../shared/utils/auth.js';
import { AuthenticationError } from '../../shared/errors/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role: 'customer' | 'staff' | 'admin' };
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = getTokenFromRequest({ cookies: req.cookies as Record<string, string>, headers: req.headers });
  if (!token) {
    throw new AuthenticationError('Please sign in.');
  }

  try {
    const raw = verifyToken(token) as TokenPayload & { id?: string };
    const userId = raw.userId ?? raw.id;
    if (!userId || !raw.role) {
      throw new AuthenticationError('Please sign in again.');
    }
    req.user = { userId, role: raw.role };
    next();
  } catch {
    throw new AuthenticationError('Please sign in again.');
  }
}
