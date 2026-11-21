/**
 * Standardized API response envelope.
 * Both success and error responses include `status` (HTTP status code) and `code` (machine-readable).
 */
export type ApiResponse<T = Record<string, never>> =
  | ({ success: true; error?: string; status: number; code?: string } & T)
  | { success: false; error: string; status: number; code: string };

/**
 * Client-side HTTP error matching the server's AppError contract.
 * `status` = HTTP status code, `code` = stable machine-readable error code.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromResponse(data: ApiResponse<never>): ApiError {
    return new ApiError(data.error, data.status, data.code);
  }
}