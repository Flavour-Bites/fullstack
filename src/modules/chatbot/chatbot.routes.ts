import { Router } from 'express';
import { chatbotController } from './chatbot.controller.js';
import { validate } from '../../app/middleware/validate.js';
import { chatSchema } from './chatbot.schemas.js';

const router = Router();

router.post('/', validate(chatSchema), chatbotController.chat);

export default router;
