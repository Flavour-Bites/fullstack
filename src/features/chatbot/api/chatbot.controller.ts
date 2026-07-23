import { Request, Response } from 'express';
import { chatbotService } from './chatbot.service';
import { asyncHandler } from '../../../app/middleware/asyncHandler';

export const chatbotController = {
  chat: asyncHandler(async (req: Request, res: Response) => {
    const text = await chatbotService.chat(req.body.messages);
    res.json({ success: true, text });
  }),
};
