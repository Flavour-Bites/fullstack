import { AppError } from './AppError.js';

export class AuthenticationError extends AppError {
  constructor(message = 'Please sign in.') {
    super(401, message);
  }
}
