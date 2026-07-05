import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from '../../shared/errors/index.js';

type Role = 'customer' | 'staff' | 'admin';

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role as Role)) {
      throw new AuthorizationError('You do not have access to this page.');
    }
    next();
  };
}
