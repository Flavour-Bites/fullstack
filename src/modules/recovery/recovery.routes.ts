import { Router } from 'express';
import { recoveryController } from './recovery.controller.js';
import { requireAuth } from '../../app/middleware/requireAuth.js';
import { requireRole } from '../../app/middleware/requireRole.js';
import { validate } from '../../app/middleware/validate.js';
import { recoveryCreateSchema, recoveryUpdateSchema } from './recovery.schemas.js';

const router = Router();

router.post('/', validate(recoveryCreateSchema), recoveryController.create);
router.get('/', requireAuth, requireRole('admin', 'staff'), recoveryController.findAll);
router.patch('/:id', requireAuth, requireRole('admin'), validate(recoveryUpdateSchema), recoveryController.updateStatus);

export default router;
