import { Router } from 'express';
import { uploadsController } from './uploads.controller.js';
import { requireAuth } from '../../app/middleware/requireAuth.js';
import { requireRole } from '../../app/middleware/requireRole.js';
import { validate } from '../../app/middleware/validate.js';
import { imageUploadSchema, imageDeleteSchema } from './uploads.schemas.js';

const router = Router();

router.post('/image', requireAuth, validate(imageUploadSchema), uploadsController.uploadImage);
router.delete('/image', requireAuth, requireRole('admin', 'staff'), validate(imageDeleteSchema), uploadsController.deleteImage);

export default router;
