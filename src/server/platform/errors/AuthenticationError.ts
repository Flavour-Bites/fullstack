import { AppError } from './AppError';

export class AuthenticationError extends AppError {
  constructor(message = 'Please sign in.') {
    super(401, message);
  }
}
