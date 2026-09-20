import { doubleCsrf } from 'csrf-csrf';
import { env } from './env';

export const {
  invalidCsrfTokenError,
  generateCsrfToken: generateToken,
  validateRequest,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => env.CSRF_SECRET,
  getSessionIdentifier: () => 'stateless',
  cookieName: 'csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: env.cookiePolicy.sameSite,
    path: '/',
    secure: env.cookiePolicy.secure,
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'],
});
