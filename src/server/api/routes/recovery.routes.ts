import { Router } from 'express';
import { recoveryController } from '../controllers/recovery.controller';
import { requireAuth } from '../../platform/middleware/requireAuth';
import { requireRole } from '../../platform/middleware/requireRole';
import { validate } from '../../platform/middleware/validate';
import { recoveryCreateSchema, recoveryUpdateSchema } from '../../modules/recovery/recovery.schemas';
import { recoveryLimiter } from '../../platform/config/rateLimiter';

const router = Router();

// Recovery creation is intentionally unauthenticated (user forgot password).
// Rate-limited to 3 requests/hour to prevent spam. Admin verifies identity on approval.
router.post('/', recoveryLimiter, validate(recoveryCreateSchema), recoveryController.create);
router.get('/', requireAuth, requireRole('admin', 'staff'), recoveryController.findAll);
router.patch('/:id', requireAuth, requireRole('admin'), validate(recoveryUpdateSchema), recoveryController.updateStatus);

export default router;
