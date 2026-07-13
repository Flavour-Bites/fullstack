import helmet from 'helmet';

const ALLOWED_SCRIPT_SRC = [
  "'self'",
  'https://accounts.google.com',
  'https://apis.google.com',
];

const ALLOWED_STYLE_SRC = [
  "'self'",
  "'unsafe-inline'",
  'https://fonts.googleapis.com',
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

export const securityConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ALLOWED_SCRIPT_SRC,
      styleSrc: ALLOWED_STYLE_SRC,
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
