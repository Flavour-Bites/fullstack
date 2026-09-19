import { doubleCsrf } from 'csrf-csrf';
import { env, isHttpsUrl } from './env';

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
    sameSite: env.isProd && isHttpsUrl(env.APP_URL) ? 'none' : 'lax',
    path: '/',
    // Secure follows the public origin's scheme (see authCookieOptions).
    secure: isHttpsUrl(env.APP_URL),
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'],
});
