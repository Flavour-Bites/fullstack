import { Router } from 'express';
import { usersController } from './users.controller';
import { requireAuth } from '../../../app/middleware/requireAuth';
import { requireRole } from '../../../app/middleware/requireRole';
import { validate } from '../../../app/middleware/validate';
import { updateUserRoleSchema } from './users.schemas';

const router = Router();

router.get('/', requireAuth, requireRole('admin'), usersController.findAll);
router.patch('/:id', requireAuth, requireRole('admin'), validate(updateUserRoleSchema), usersController.updateRole);
router.delete('/:id', requireAuth, requireRole('admin'), usersController.delete);

export default router;
