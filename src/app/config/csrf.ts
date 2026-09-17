import { doubleCsrf } from 'csrf-csrf';

export const {
  invalidCsrfTokenError,
  generateCsrfToken: generateToken,
  validateRequest,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'flavour-bites-development-csrf-secret',
  getSessionIdentifier: () => 'stateless',
  cookieName: 'csrf-token',
  cookieOptions: {



    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'],
});
