import { Router } from 'express';
import { chatbotController } from './chatbot.controller';
import { validate } from '../../../app/middleware/validate';
import { chatSchema } from './chatbot.schemas';
import { chatLimiter } from '../../../app/config/rateLimiter';
import { requireAuth } from '../../../app/middleware/requireAuth';

const router = Router();

router.post('/', chatLimiter, requireAuth, validate(chatSchema), chatbotController.chat);

export default router;
