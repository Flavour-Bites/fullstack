import { Router } from 'express';
import { reviewsController } from '../controllers/reviews.controller';
import { requireAuth } from '../../platform/middleware/requireAuth';
import { requireRole } from '../../platform/middleware/requireRole';
import { validate } from '../../platform/middleware/validate';
import { createReviewSchema, updateReviewSchema } from '../../modules/reviews/reviews.schemas';

const router = Router();

router.get('/', reviewsController.findAll);
router.post('/', requireAuth, validate(createReviewSchema), reviewsController.create);
router.patch('/:id', requireAuth, requireRole('admin', 'staff'), validate(updateReviewSchema), reviewsController.update);
router.delete('/:id', requireAuth, requireRole('admin'), reviewsController.delete);

export default router;
