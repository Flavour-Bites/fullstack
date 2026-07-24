import { Router } from 'express';
import { categoriesController } from './categories.controller';
import { requireAuth } from '../../../app/middleware/requireAuth';
import { requireRole } from '../../../app/middleware/requireRole';
import { validate } from '../../../app/middleware/validate';
import { categorySchema, categoryUpdateSchema } from './categories.schemas';

const router = Router();

router.get('/', categoriesController.findAll);
router.post('/', requireAuth, requireRole('admin', 'staff'), validate(categorySchema), categoriesController.create);
router.patch('/:id', requireAuth, requireRole('admin', 'staff'), validate(categoryUpdateSchema), categoriesController.update);
router.delete('/:id', requireAuth, requireRole('admin', 'staff'), categoriesController.delete);

export default router;
