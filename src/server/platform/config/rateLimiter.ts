import rateLimit from 'express-rate-limit';
import { FIFTEEN_MINUTES_MS, ONE_MINUTE_MS, ONE_HOUR_MS } from '../../../shared/constants/index';

export const authLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  max: 10,
  message: { success: false, error: 'Too many tries. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const passwordVerifyLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  max: 5,
  message: { success: false, error: 'Too many password attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const chatLimiter = rateLimit({
  windowMs: ONE_MINUTE_MS,
  max: 20,
  message: { success: false, error: 'Too many messages. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const recoveryLimiter = rateLimit({
  windowMs: ONE_HOUR_MS,
  max: 3,
  message: { success: false, error: 'Too many recovery requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Baseline per-IP limit for authenticated and resource-expensive endpoints.
// Applied (first middleware) on every route that authenticates or touches the
// database so no authorization-gated or data-heavy handler can be hammered
// into a DoS. Sensitive flows (login, password verify, chat, recovery) keep
// their tighter dedicated limiters, which stack on top of this one.
export const apiLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  max: 300,
  message: { success: false, error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public contact form: unauthenticated and CPU/IO-light, but a vector for
// spam. A modest per-IP cap keeps the fan-out to Telegram bounded.
export const contactLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  max: 20,
  message: { success: false, error: 'Too many messages. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
