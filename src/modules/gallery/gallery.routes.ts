import { Router } from 'express';
import { galleryController } from './gallery.controller.js';
import { requireAuth } from '../../app/middleware/requireAuth.js';
import { requireRole } from '../../app/middleware/requireRole.js';
import { validate } from '../../app/middleware/validate.js';
import { gallerySchema } from './gallery.schemas.js';

const router = Router();

router.get('/', galleryController.findAll);
router.post('/', requireAuth, requireRole('admin', 'staff'), validate(gallerySchema), galleryController.create);
router.patch('/:id', requireAuth, requireRole('admin', 'staff'), galleryController.update);
router.delete('/:id', requireAuth, requireRole('admin', 'staff'), galleryController.delete);

export default router;
