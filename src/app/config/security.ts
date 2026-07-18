import helmet from 'helmet';

function createSecurityConfig() {
  const isDev = process.env.NODE_ENV !== 'production';

  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // --- scripts ---
        // Production: loaded from self, Google (auth), Telegram (login widget).
        // Telegram widget uses eval() internally — unsafe-eval is unavoidable.
        // Dev only: Vite injects inline scripts (React preamble, HMR client).
        scriptSrc: [
          "'self'",
          'https://accounts.google.com',
          'https://apis.google.com',
          'https://telegram.org',
          "'unsafe-eval'",
          ...(isDev ? ["'unsafe-inline'"] : []),
        ],
        // --- styles ---
        // Dev only: Vite/Tailwind injects inline styles for HMR.
        // Production: all CSS is extracted to static files.
        styleSrc: [
          "'self'",
          'https://fonts.googleapis.com',
          ...(isDev ? ["'unsafe-inline'"] : []),
        ],
        fontSrc: [
          "'self'",
          'https://fonts.gstatic.com',
        ],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://res.cloudinary.com',
          'https://images.unsplash.com',
        ],
        // --- connections ---
        // Dev only: Vite HMR WebSocket runs on a local port.
        connectSrc: [
          "'self'",
          'https://api.cloudinary.com',
          ...(isDev ? [
            'ws://localhost:*',
            'ws://127.0.0.1:*',
            'http://localhost:*',
            'http://127.0.0.1:*',
          ] : []),
        ],
        objectSrc: ["'none'"],
        mediaSrc: ["'none'"],
        // Telegram login widget renders an iframe from telegram.org and oauth.telegram.org.
        frameSrc: ['https://telegram.org', 'https://oauth.telegram.org'],
      },
    },
    // Disable X-Frame-Options — we rely on CSP frame-src instead.
    // Helmet's default frameguard (SAMEORIGIN) conflicts with Telegram OAuth iframes.
    frameguard: false,
    // Disable cross-origin policies that block Telegram OAuth popup/iframe communication.
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
  });
}

export const securityConfig = createSecurityConfig();
export { createSecurityConfig };
