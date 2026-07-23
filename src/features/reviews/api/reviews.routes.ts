import { Router } from 'express';
import { reviewsController } from './reviews.controller';
import { requireAuth } from '../../../app/middleware/requireAuth';
import { requireRole } from '../../../app/middleware/requireRole';
import { validate } from '../../../app/middleware/validate';
import { createReviewSchema, updateReviewSchema } from './reviews.schemas';

const router = Router();

router.get('/', reviewsController.findAll);
router.post('/', requireAuth, validate(createReviewSchema), reviewsController.create);
router.patch('/:id', requireAuth, requireRole('admin', 'staff'), validate(updateReviewSchema), reviewsController.update);
router.delete('/:id', requireAuth, requireRole('admin'), reviewsController.delete);

export default router;
