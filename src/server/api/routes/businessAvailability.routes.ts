import { Router } from 'express';
import { businessAvailabilityController } from '../controllers/businessAvailability.controller';
import { requireAuth } from '../../platform/middleware/requireAuth';
import { requireRole } from '../../platform/middleware/requireRole';
import { validate } from '../../platform/middleware/validate';
import { apiLimiter } from '../../platform/config/rateLimiter';
import { z } from 'zod';

const router = Router();

const updatePolicySchema = z.object({
  isEnabled: z.boolean().optional(),
  timezone: z.string().optional(),
  minimumLeadTimeHours: z.coerce.number().int().min(0).optional(),
  mondayEnabled: z.boolean().optional(),
  tuesdayEnabled: z.boolean().optional(),
  wednesdayEnabled: z.boolean().optional(),
  thursdayEnabled: z.boolean().optional(),
  fridayEnabled: z.boolean().optional(),
  saturdayEnabled: z.boolean().optional(),
  sundayEnabled: z.boolean().optional(),
});

const validateDateSchema = z.object({
  eventDate: z.string().min(1),
});

// Public endpoint - get current availability
router.get('/', apiLimiter, businessAvailabilityController.getAvailability);

// Public endpoint - validate a specific date
router.post('/validate', apiLimiter, validate(validateDateSchema), businessAvailabilityController.validateDate);

// Admin endpoints - require auth and admin/staff role
router.patch('/', apiLimiter, requireAuth, requireRole('admin', 'staff'), validate(updatePolicySchema), businessAvailabilityController.updatePolicy);

export default router;