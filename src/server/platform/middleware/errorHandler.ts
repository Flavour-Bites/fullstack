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

  // Handle oversized request payloads from body-parser (e.g. limit: '1mb')
  if (
    (err as any).type === 'entity.too.large' ||
    (err as any).status === 413 ||
    (err as any).statusCode === 413
  ) {
    return res
      .status(413)
      .json(errorResponse('Request payload is too large. Maximum size is 1MB.', 413, 'PAYLOAD_TOO_LARGE'));
  }

  // Handle malformed JSON request bodies
  if (err.name === 'SyntaxError' && 'body' in err && (err as any).status === 400) {
    return res
      .status(400)
      .json(errorResponse('Malformed JSON in request body.', 400, 'BAD_REQUEST'));
  }

  // Handle any other client-level 4xx errors gracefully
  if (typeof (err as any).status === 'number' && (err as any).status >= 400 && (err as any).status < 500) {
    const statusCode = (err as any).status;
    return res
      .status(statusCode)
      .json(errorResponse(err.message || 'Client error.', statusCode, 'CLIENT_ERROR'));
  }

  console.error('[Unhandled Error]', err);
  return res
    .status(500)
    .json(errorResponse('Internal server error.', 500, 'INTERNAL_ERROR'));
}