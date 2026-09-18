import { AppError } from './AppError';

export class AuthorizationError extends AppError {
  constructor(message = 'You do not have access.') {
    super(403, message);
  }
}
