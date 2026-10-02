import { Router } from 'express';
import { reviewsController } from '../controllers/reviews.controller';
import { requireAuth } from '../../platform/middleware/requireAuth';
import { requireRole } from '../../platform/middleware/requireRole';
import { validate } from '../../platform/middleware/validate';
import { apiLimiter } from '../../platform/config/rateLimiter';
import { createReviewSchema } from '../../modules/reviews/reviews.schemas';

const router = Router();

router.get('/', apiLimiter, reviewsController.findAll);
router.post('/', apiLimiter, requireAuth, validate(createReviewSchema), reviewsController.create);
router.delete('/:id', apiLimiter, requireAuth, requireRole('admin'), reviewsController.delete);

export default router;
