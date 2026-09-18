import { Router } from 'express';
import { ordersController } from '../controllers/orders.controller';
import { requireAuth } from '../../platform/middleware/requireAuth';
import { requireRole } from '../../platform/middleware/requireRole';
import { validate } from '../../platform/middleware/validate';
import { createOrderSchema, acceptPriceSchema } from '../schemas/orders.schemas';

const router = Router();

router.get('/', requireAuth, ordersController.findAll);
router.post('/', requireAuth, validate(createOrderSchema), ordersController.create);
router.patch('/:id', requireAuth, requireRole('admin', 'staff'), ordersController.update);
router.post('/:id/accept-price', requireAuth, validate(acceptPriceSchema), ordersController.acceptPrice);
router.delete('/:id', requireAuth, requireRole('admin', 'staff'), ordersController.softDelete);
router.post('/:id/restore', requireAuth, requireRole('admin', 'staff'), ordersController.restore);
router.get('/:id/timeline', requireAuth, ordersController.timeline);

export default router;
