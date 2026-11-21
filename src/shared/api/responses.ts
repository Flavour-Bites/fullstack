import type { ApiResponse } from './types';

/**
 * Success response factory — guarantees the exact contract:
 * { success: true, status: 200, code?: 'OK', ...data }
 */
export function successResponse<T>(
  data: T,
  status = 200,
  code = 'OK',
): ApiResponse<T> {
  return { success: true, status, code, ...data };
}

/**
 * Error response factory — guarantees the exact contract:
 * { success: false, error: string, status: number, code: string, details?: unknown }
 */
export function errorResponse(
  message: string,
  status: number,
  code: string,
  details?: unknown,
): ApiResponse<never> {
  const body: ApiResponse<never> = { success: false, error: message, status, code };
  if (details !== undefined) {
    (body as any).details = details;
  }
  return body;
}