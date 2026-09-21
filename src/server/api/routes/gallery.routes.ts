import { Router } from 'express';
import { galleryController } from '../controllers/gallery.controller';
import { requireAuth } from '../../platform/middleware/requireAuth';
import { requireRole } from '../../platform/middleware/requireRole';
import { validate } from '../../platform/middleware/validate';
import { apiLimiter } from '../../platform/config/rateLimiter';
import { gallerySchema, galleryUpdateSchema } from '../../modules/gallery/gallery.schemas';

const router = Router();

router.get('/', apiLimiter, galleryController.findAll);
router.post('/', apiLimiter, requireAuth, requireRole('admin', 'staff'), validate(gallerySchema), galleryController.create);
router.patch('/:id', apiLimiter, requireAuth, requireRole('admin', 'staff'), validate(galleryUpdateSchema), galleryController.update);
router.delete('/:id', apiLimiter, requireAuth, requireRole('admin', 'staff'), galleryController.delete);

export default router;
