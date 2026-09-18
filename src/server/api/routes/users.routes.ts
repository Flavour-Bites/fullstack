import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { requireAuth } from '../../platform/middleware/requireAuth';
import { requireRole } from '../../platform/middleware/requireRole';
import { validate } from '../../platform/middleware/validate';
import { updateUserRoleSchema } from '../schemas/users.schemas';

const router = Router();

router.get('/', requireAuth, requireRole('admin'), usersController.findAll);
router.patch('/:id', requireAuth, requireRole('admin'), validate(updateUserRoleSchema), usersController.updateRole);
router.delete('/:id', requireAuth, requireRole('admin'), usersController.delete);

export default router;
