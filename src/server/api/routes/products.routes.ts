import { Router } from 'express';
import { productsController } from '../controllers/products.controller';
import { reviewsController } from '../controllers/reviews.controller';
import { requireAuth } from '../../platform/middleware/requireAuth';
import { requireRole } from '../../platform/middleware/requireRole';
import { validate } from '../../platform/middleware/validate';
import { apiLimiter } from '../../platform/config/rateLimiter';
import { productSchema, productUpdateSchema } from '../../modules/products/products.schemas';
import { createReviewSchema } from '../../modules/reviews/reviews.schemas';

const router = Router();

// Product catalog
router.get('/', apiLimiter, productsController.findAll);
router.get('/:id', apiLimiter, productsController.findById);
router.post('/', apiLimiter, requireAuth, requireRole('admin', 'staff'), validate(productSchema), productsController.create);
router.patch('/:id', apiLimiter, requireAuth, requireRole('admin', 'staff'), validate(productUpdateSchema), productsController.update);
router.delete('/:id', apiLimiter, requireAuth, requireRole('admin', 'staff'), productsController.delete);

// Nested reviews for a specific product
router.get('/:id/reviews', apiLimiter, reviewsController.findByProduct);
router.post('/:id/reviews', apiLimiter, requireAuth, validate(createReviewSchema), reviewsController.createForProduct);

export default router;
