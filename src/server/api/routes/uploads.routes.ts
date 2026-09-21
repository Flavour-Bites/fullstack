import { Router, raw } from 'express';
import { uploadsController } from '../controllers/uploads.controller';
import { requireAuth } from '../../platform/middleware/requireAuth';
import { requireRole } from '../../platform/middleware/requireRole';
import { validate } from '../../platform/middleware/validate';
import { apiLimiter } from '../../platform/config/rateLimiter';
import { imageUploadSchema, imageDeleteSchema } from '../../modules/uploads/uploads.schemas';

const router = Router();

router.post('/image', apiLimiter, requireAuth, raw({ type: 'application/json', limit: '12mb' }), validate(imageUploadSchema), uploadsController.uploadImage);
router.delete('/image', apiLimiter, requireAuth, requireRole('admin', 'staff'), validate(imageDeleteSchema), uploadsController.deleteImage);

export default router;
