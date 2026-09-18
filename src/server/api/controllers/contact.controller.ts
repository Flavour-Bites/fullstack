import { Request, Response } from 'express';
import { contactService } from '../../modules/contact/contact.service';
import { asyncHandler } from '../../platform/middleware/asyncHandler';

export const contactController = {
  submit: asyncHandler(async (req: Request, res: Response) => {
    const result = await contactService.submitContact(req.body);
    res.json({ success: true, ...result });
  }),
};