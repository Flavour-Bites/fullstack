import { Router } from 'express';
import { recoveryController } from './recovery.controller';
import { requireAuth } from '../../../app/middleware/requireAuth';
import { requireRole } from '../../../app/middleware/requireRole';
import { validate } from '../../../app/middleware/validate';
import { recoveryCreateSchema, recoveryUpdateSchema } from './recovery.schemas';
import { recoveryLimiter } from '../../../app/config/rateLimiter';

const router = Router();

// Recovery creation is intentionally unauthenticated (user forgot password).
// Rate-limited to 3 requests/hour to prevent spam. Admin verifies identity on approval.
router.post('/', recoveryLimiter, validate(recoveryCreateSchema), recoveryController.create);
router.get('/', requireAuth, requireRole('admin', 'staff'), recoveryController.findAll);
router.patch('/:id', requireAuth, requireRole('admin'), validate(recoveryUpdateSchema), recoveryController.updateStatus);

export default router;
