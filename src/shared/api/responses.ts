import type { ApiResponse } from './types';

/**
 * Success response factory — ensures every OK response matches ApiResponse.
 * Usage: return res.json(successResponse({ requests }));
 */
export function successResponse<T>(data: T): ApiResponse<T> {
  return { success: true, ...data };
}

/**
 * Error response factory — matches the exact shape ApiError.fromResponse expects.
 * Usage: return res.status(404).json(errorResponse('Not found', 404, 'NOT_FOUND'));
 */
export function errorResponse(
  message: string,
  status: number,
  code?: string,
  details?: unknown,
): ApiResponse<never> {
  const body: ApiResponse<never> = { success: false, error: message, status, code };
  if (details !== undefined) {
    (body as any).details = details;
  }
  return body;
}