import { Router } from 'express';
import { paymentController } from './payment.controller.js';
import { requireAuth } from '../../app/middleware/requireAuth.js';
import { requireRole } from '../../app/middleware/requireRole.js';
import { validate } from '../../app/middleware/validate.js';
import { initiatePaymentSchema, recordManualPaymentSchema } from './payment.schemas.js';

const router = Router();

router.post('/initiate', requireAuth, validate(initiatePaymentSchema), paymentController.initiate);
router.get('/callback', paymentController.callback);
router.post('/webhook', paymentController.webhook);
router.post('/requests/:id/record-payment', requireAuth, requireRole('admin', 'staff'), validate(recordManualPaymentSchema), paymentController.recordManual);

export default router;
