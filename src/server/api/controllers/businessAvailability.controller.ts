import { Request, Response } from 'express';
import { businessAvailabilityService } from '../../modules/business/businessAvailability.service';
import { asyncHandler } from '../../platform/middleware/asyncHandler';
import { ValidationError } from '../../platform/errors/index';

export const businessAvailabilityController = {
  getAvailability: asyncHandler(async (_req: Request, res: Response) => {
    const availability = await businessAvailabilityService.getAvailabilityResponse();
    res.json({ success: true, ...availability });
  }),

  updatePolicy: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body;
    
    if (input.minimumLeadTimeHours !== undefined) {
      const hours = Number(input.minimumLeadTimeHours);
      if (!Number.isInteger(hours) || hours < 0) {
        throw new ValidationError('Minimum lead time must be a non-negative integer');
      }
      input.minimumLeadTimeHours = hours;
    }

    if (input.timezone !== undefined) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: input.timezone });
      } catch {
        throw new ValidationError('Invalid timezone');
      }
    }

    const updated = await businessAvailabilityService.updatePolicy(input);
    res.json({ success: true, policy: updated });
  }),

  validateDate: asyncHandler(async (req: Request, res: Response) => {
    const { eventDate } = req.body;
    
    if (!eventDate || typeof eventDate !== 'string') {
      throw new ValidationError('eventDate is required');
    }
    
    const result = await businessAvailabilityService.validateOrderDate(eventDate);
    res.json({ success: true, ...result });
  }),
};