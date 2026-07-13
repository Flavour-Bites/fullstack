import { Router } from 'express';
import { categoriesController } from './categories.controller.js';
import { requireAuth } from '../../app/middleware/requireAuth.js';
import { requireRole } from '../../app/middleware/requireRole.js';
import { validate } from '../../app/middleware/validate.js';
import { categorySchema, categoryUpdateSchema } from './categories.schemas.js';

const router = Router();

router.get('/', categoriesController.findAll);
router.post('/', requireAuth, requireRole('admin', 'staff'), validate(categorySchema), categoriesController.create);
router.patch('/:id', requireAuth, requireRole('admin', 'staff'), validate(categoryUpdateSchema), categoriesController.update);
router.delete('/:id', requireAuth, requireRole('admin', 'staff'), categoriesController.delete);

export default router;
