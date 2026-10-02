import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/index';
import { errorResponse } from '@shared/api';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res
      .status(err.statusCode)
      .json(errorResponse(err.message, err.statusCode, err.code));
  }

  if (err.name === 'ZodError') {
    return res
      .status(400)
      .json(errorResponse('Validation failed', 400, 'VALIDATION_ERROR', (err as any).errors));
  }

  if ((err as any).code === 'P2025') {
    return res
      .status(404)
      .json(errorResponse('Record not found.', 404, 'NOT_FOUND'));
  }

  console.error('[Unhandled Error]', err);
  return res
    .status(500)
    .json(errorResponse('Internal server error.', 500, 'INTERNAL_ERROR'));
}