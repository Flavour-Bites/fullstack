import { Router } from 'express';
import { ordersController } from './orders.controller';
import { requireAuth } from '../../../app/middleware/requireAuth';
import { requireRole } from '../../../app/middleware/requireRole';
import { validate } from '../../../app/middleware/validate';
import { createOrderSchema, acceptPriceSchema } from './orders.schemas';

const router = Router();

router.get('/', requireAuth, ordersController.findAll);
router.post('/', requireAuth, validate(createOrderSchema), ordersController.create);
router.patch('/:id', requireAuth, requireRole('admin', 'staff'), ordersController.update);
router.post('/:id/accept-price', requireAuth, validate(acceptPriceSchema), ordersController.acceptPrice);
router.delete('/:id', requireAuth, requireRole('admin', 'staff'), ordersController.softDelete);
router.post('/:id/restore', requireAuth, requireRole('admin', 'staff'), ordersController.restore);
router.get('/:id/timeline', requireAuth, ordersController.timeline);

export default router;
