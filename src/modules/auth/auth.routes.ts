import { Router } from 'express';
import { authController } from './auth.controller.js';
import { requireAuth } from '../../app/middleware/requireAuth.js';
import { validate } from '../../app/middleware/validate.js';
import { authLimiter, passwordVerifyLimiter } from '../../app/config/rateLimiter.js';
import {
  finalizeSchema,
  passwordSchema,
  telegramPasswordSchema,
} from './auth.schemas.js';

const router = Router();

router.get('/telegram/login', authLimiter, authController.initiateTelegramLogin);
router.post('/telegram/login', authLimiter, authController.initiateTelegramLogin);

router.get('/telegram/callback', authController.handleTelegramCallback);
router.post('/telegram/callback', authController.handleTelegramCallback);

router.post('/telegram/finalize', authLimiter, validate(finalizeSchema), authController.finalizeTelegram);
router.post('/password', requireAuth, validate(passwordSchema), authController.setPassword);
router.post('/password/verify', requireAuth, passwordVerifyLimiter, authController.verifyPassword);
router.post('/telegram-password', authLimiter, validate(telegramPasswordSchema), authController.telegramPasswordLogin);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);

export default router;
