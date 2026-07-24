import { Router } from 'express';
import { galleryController } from './gallery.controller';
import { requireAuth } from '../../../app/middleware/requireAuth';
import { requireRole } from '../../../app/middleware/requireRole';
import { validate } from '../../../app/middleware/validate';
import { gallerySchema, galleryUpdateSchema } from './gallery.schemas';

const router = Router();

router.get('/', galleryController.findAll);
router.post('/', requireAuth, requireRole('admin', 'staff'), validate(gallerySchema), galleryController.create);
router.patch('/:id', requireAuth, requireRole('admin', 'staff'), validate(galleryUpdateSchema), galleryController.update);
router.delete('/:id', requireAuth, requireRole('admin', 'staff'), galleryController.delete);

export default router;
