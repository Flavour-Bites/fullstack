export type ApiResponse<T = Record<string, never>> =
  | ({ success: true; error?: string } & T)
  | { success: false; error: string; code?: string; status?: number };

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromResponse(data: ApiResponse<never>, httpStatus?: number): ApiError {
    return new ApiError(data.error, data.status ?? httpStatus, data.code);
  }
}