import { Router } from 'express';
import { authController } from './auth.controller';
import { requireAuth } from '../../../app/middleware/requireAuth';
import { validate } from '../../../app/middleware/validate';
import { authLimiter, passwordVerifyLimiter } from '../../../app/config/rateLimiter';
import {
  finalizeSchema,
  passwordSchema,
  telegramPasswordSchema,
} from './auth.schemas';

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
