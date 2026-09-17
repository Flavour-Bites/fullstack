export type ApiResponse<T = Record<string, never>> =
  | ({ success: true; error?: string } & T)
  | { success: false; error: string };

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}
