import { Request, Response } from 'express';
import { contactService } from './contact.service.js';
import { asyncHandler } from '../../app/middleware/asyncHandler.js';

export const contactController = {
  submit: asyncHandler(async (req: Request, res: Response) => {
    const result = await contactService.submitContact(req.body);
    res.json({ success: true, ...result });
  }),
};