import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAuth } from '../../platform/middleware/requireAuth';
import { validate } from '../../platform/middleware/validate';
import { authLimiter, apiLimiter, passwordVerifyLimiter } from '../../platform/config/rateLimiter';
import {
  finalizeSchema,
  passwordSchema,
  passwordVerifySchema,
  telegramPasswordSchema,
  updateProfileSchema
} from '../../modules/auth/auth.schemas';

const router = Router();

router.get('/telegram/login', authLimiter, authController.initiateTelegramLogin);
router.post('/telegram/login', authLimiter, authController.initiateTelegramLogin);

router.get('/telegram/callback', authLimiter, authController.handleTelegramCallback);
router.post('/telegram/callback', authLimiter, authController.handleTelegramCallback);

router.post('/telegram/finalize', authLimiter, validate(finalizeSchema), authController.finalizeTelegram);
router.post('/password', authLimiter, requireAuth, validate(passwordSchema), authController.setPassword);
router.post('/password/verify', passwordVerifyLimiter, requireAuth, validate(passwordVerifySchema), authController.verifyPassword);
router.post('/telegram-password', authLimiter, validate(telegramPasswordSchema), authController.telegramPasswordLogin);
router.post('/logout', apiLimiter, authController.logout);
router.get('/me', apiLimiter, requireAuth, authController.me);
router.put('/me', apiLimiter, requireAuth, validate(updateProfileSchema), authController.updateProfile);

export default router;
