import { Router } from 'express';
import { ordersController } from '../controllers/orders.controller';
import { requireAuth } from '../../platform/middleware/requireAuth';
import { requireRole } from '../../platform/middleware/requireRole';
import { validate } from '../../platform/middleware/validate';
import { apiLimiter } from '../../platform/config/rateLimiter';
import { createOrderSchema, updateOrderSchema, acceptPriceSchema } from '../../modules/orders/orders.schemas';

const router = Router();

router.get('/', apiLimiter, requireAuth, ordersController.findAll);
router.post('/', apiLimiter, requireAuth, validate(createOrderSchema), ordersController.create);
router.patch('/:id', apiLimiter, requireAuth, requireRole('admin', 'staff'), validate(updateOrderSchema), ordersController.update);
router.post('/:id/accept-price', apiLimiter, requireAuth, validate(acceptPriceSchema), ordersController.acceptPrice);
router.delete('/:id', apiLimiter, requireAuth, requireRole('admin', 'staff'), ordersController.softDelete);
router.post('/:id/restore', apiLimiter, requireAuth, requireRole('admin', 'staff'), ordersController.restore);
router.get('/:id/timeline', apiLimiter, requireAuth, ordersController.timeline);

export default router;
