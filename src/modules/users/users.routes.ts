import { Router } from 'express';
import { usersController } from './users.controller.js';
import { requireAuth } from '../../app/middleware/requireAuth.js';
import { requireRole } from '../../app/middleware/requireRole.js';
import { validate } from '../../app/middleware/validate.js';
import { updateUserRoleSchema } from './users.schemas.js';

const router = Router();

router.get('/', requireAuth, requireRole('admin'), usersController.findAll);
router.patch('/:id', requireAuth, requireRole('admin'), validate(updateUserRoleSchema), usersController.updateRole);
router.delete('/:id', requireAuth, requireRole('admin'), usersController.delete);

export default router;
