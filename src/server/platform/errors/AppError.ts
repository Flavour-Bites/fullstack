export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed.', code?: string) {
    super(400, message, code ?? 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found.', code?: string) {
    super(404, message, code ?? 'NOT_FOUND');
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required.', code?: string) {
    super(401, message, code ?? 'UNAUTHENTICATED');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied.', code?: string) {
    super(403, message, code ?? 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict.', code?: string) {
    super(409, message, code ?? 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests.', code?: string) {
    super(429, message, code ?? 'RATE_LIMITED');
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message = 'Unprocessable entity.', code?: string) {
    super(422, message, code ?? 'UNPROCESSABLE_ENTITY');
  }
}