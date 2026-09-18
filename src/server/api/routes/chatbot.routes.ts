import { Router } from 'express';
import { chatbotController } from '../controllers/chatbot.controller';
import { validate } from '../../platform/middleware/validate';
import { chatSchema } from '../schemas/chatbot.schemas';
import { chatLimiter } from '../../platform/config/rateLimiter';
import { requireAuth } from '../../platform/middleware/requireAuth';

const router = Router();

router.post('/', chatLimiter, requireAuth, validate(chatSchema), chatbotController.chat);

export default router;
