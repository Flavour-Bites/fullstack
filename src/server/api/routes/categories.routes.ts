import { Router } from 'express';
import { categoriesController } from '../controllers/categories.controller';
import { requireAuth } from '../../platform/middleware/requireAuth';
import { requireRole } from '../../platform/middleware/requireRole';
import { validate } from '../../platform/middleware/validate';
import { apiLimiter } from '../../platform/config/rateLimiter';
import { categorySchema, categoryUpdateSchema } from '../../modules/categories/categories.schemas';

const router = Router();

router.get('/', apiLimiter, categoriesController.findAll);
router.post('/', apiLimiter, requireAuth, requireRole('admin', 'staff'), validate(categorySchema), categoriesController.create);
router.patch('/:id', apiLimiter, requireAuth, requireRole('admin', 'staff'), validate(categoryUpdateSchema), categoriesController.update);
router.delete('/:id', apiLimiter, requireAuth, requireRole('admin', 'staff'), categoriesController.delete);

export default router;
