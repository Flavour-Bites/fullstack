import helmet from 'helmet';

const ALLOWED_SCRIPT_SRC = [
  "'self'",
  'https://accounts.google.com',
  'https://apis.google.com',
];

const ALLOWED_FONT_SRC = [
  "'self'",
  'https://fonts.gstatic.com',
];

const ALLOWED_IMG_SRC = [
  "'self'",
  'data:',
  'blob:',
  'https://res.cloudinary.com',
];

const ALLOWED_CONNECT_SRC = [
  "'self'",
  'https://api.cloudinary.com',
];

// In dev mode Vite/Tailwind injects inline styles for HMR. In production
// Vite extracts CSS to static files so unsafe-inline is unnecessary.
const styleSrc = [
  "'self'",
  'https://fonts.googleapis.com',
];
if (process.env.NODE_ENV !== 'production') {
  styleSrc.push("'unsafe-inline'");
}

export const securityConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ALLOWED_SCRIPT_SRC,
      styleSrc,
      fontSrc: ALLOWED_FONT_SRC,
      imgSrc: ALLOWED_IMG_SRC,
      connectSrc: ALLOWED_CONNECT_SRC,
      objectSrc: ["'none'"],
      mediaSrc: ["'none'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});
