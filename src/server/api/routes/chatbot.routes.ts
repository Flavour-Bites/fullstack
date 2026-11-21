import { Router } from 'express';
import { chatbotController } from '../controllers/chatbot.controller';
import { validate } from '../../platform/middleware/validate';
import { chatSchema } from '../../modules/chatbot/chatbot.schemas';
import { chatLimiter } from '../../platform/config/rateLimiter';

const router = Router();

router.post('/', chatLimiter, validate(chatSchema), chatbotController.chat);

export default router;
