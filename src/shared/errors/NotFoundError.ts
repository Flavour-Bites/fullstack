import { AppError } from './AppError.js';

export class NotFoundError extends AppError {
  constructor(message = 'Not found.') {
    super(404, message);
  }
}
