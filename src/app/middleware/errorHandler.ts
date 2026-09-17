import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors/index.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message });
    return;
  }

  if (err.name === 'ZodError') {
    res.status(400).json({ success: false, error: 'Validation failed', details: (err as any).errors });
    return;
  }

  if ((err as any).code === 'P2025') {
    res.status(404).json({ success: false, error: 'Record not found.' });
    return;
  }

  console.error('[Unhandled Error]', err);
  res.status(500).json({ success: false, error: 'Internal server error.' });
}
