import { Router } from 'express';
import { reviewsController } from './reviews.controller.js';
import { requireAuth } from '../../app/middleware/requireAuth.js';
import { requireRole } from '../../app/middleware/requireRole.js';
import { validate } from '../../app/middleware/validate.js';
import { createReviewSchema, updateReviewSchema } from './reviews.schemas.js';

const router = Router();

router.get('/', reviewsController.findAll);
router.post('/', requireAuth, validate(createReviewSchema), reviewsController.create);
router.patch('/:id', requireAuth, requireRole('admin', 'staff'), validate(updateReviewSchema), reviewsController.update);
router.delete('/:id', requireAuth, requireRole('admin'), reviewsController.delete);

export default router;
