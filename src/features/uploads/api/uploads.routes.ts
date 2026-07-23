import { Router, raw } from 'express';
import { uploadsController } from './uploads.controller';
import { requireAuth } from '../../../app/middleware/requireAuth';
import { requireRole } from '../../../app/middleware/requireRole';
import { validate } from '../../../app/middleware/validate';
import { imageUploadSchema, imageDeleteSchema } from './uploads.schemas';

const router = Router();

router.post('/image', requireAuth, raw({ type: 'application/json', limit: '12mb' }), validate(imageUploadSchema), uploadsController.uploadImage);
router.delete('/image', requireAuth, requireRole('admin', 'staff'), validate(imageDeleteSchema), uploadsController.deleteImage);

export default router;
