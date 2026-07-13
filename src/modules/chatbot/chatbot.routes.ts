import { Router } from 'express';
import { chatbotController } from './chatbot.controller.js';
import { validate } from '../../app/middleware/validate.js';
import { chatSchema } from './chatbot.schemas.js';
import { chatLimiter } from '../../app/config/rateLimiter.js';

const router = Router();

router.post('/', chatLimiter, validate(chatSchema), chatbotController.chat);

export default router;
