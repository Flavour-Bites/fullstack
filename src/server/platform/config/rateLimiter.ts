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
