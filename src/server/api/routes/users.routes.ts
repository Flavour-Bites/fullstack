import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { requireAuth } from '../../platform/middleware/requireAuth';
import { requireRole } from '../../platform/middleware/requireRole';
import { validate } from '../../platform/middleware/validate';
import { apiLimiter } from '../../platform/config/rateLimiter';
import { updateUserRoleSchema } from '../../modules/users/users.schemas';

const router = Router();

router.get('/', apiLimiter, requireAuth, requireRole('admin'), usersController.findAll);
router.patch('/:id', apiLimiter, requireAuth, requireRole('admin'), validate(updateUserRoleSchema), usersController.updateRole);
router.delete('/:id', apiLimiter, requireAuth, requireRole('admin'), usersController.delete);

export default router;
