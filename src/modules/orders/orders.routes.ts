import { Router } from 'express';
import { ordersController } from './orders.controller.js';
import { requireAuth } from '../../app/middleware/requireAuth.js';
import { requireRole } from '../../app/middleware/requireRole.js';
import { validate } from '../../app/middleware/validate.js';
import { createOrderSchema, acceptPriceSchema } from './orders.schemas.js';

const router = Router();

router.get('/', requireAuth, ordersController.findAll);
router.post('/', requireAuth, validate(createOrderSchema), ordersController.create);
router.patch('/:id', requireAuth, requireRole('admin', 'staff'), ordersController.update);
router.post('/:id/accept-price', requireAuth, validate(acceptPriceSchema), ordersController.acceptPrice);
router.delete('/:id', requireAuth, requireRole('admin', 'staff'), ordersController.softDelete);
router.post('/:id/restore', requireAuth, requireRole('admin', 'staff'), ordersController.restore);
router.get('/:id/timeline', requireAuth, ordersController.timeline);

export default router;
