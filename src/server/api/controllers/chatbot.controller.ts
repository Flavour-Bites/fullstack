import { Request, Response } from 'express';
import { chatbotService } from '../../modules/chatbot/chatbot.service';
import { asyncHandler } from '../../platform/middleware/asyncHandler';

export const chatbotController = {
  chat: asyncHandler(async (req: Request, res: Response) => {
    const text = await chatbotService.chat(req.body.messages);
    res.json({ success: true, text });
  }),
};
