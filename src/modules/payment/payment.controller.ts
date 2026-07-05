import { Request, Response } from 'express';
import { paymentService } from './payment.service.js';
import { asyncHandler } from '../../app/middleware/asyncHandler.js';

export const paymentController = {
  initiate: asyncHandler(async (req: Request, res: Response) => {
    const result = await paymentService.initiate({
      orderId: req.body.orderId,
      amount: req.body.amount,
      phone: req.body.phone,
      email: req.body.email,
    });
    if (result.success) {
      res.json({ success: true, checkoutUrl: result.checkoutUrl, transactionRef: result.transactionRef });
    } else {
      res.status(400).json({ success: false, error: result.message });
    }
  }),

  callback: asyncHandler(async (req: Request, res: Response) => {
    const { tx_ref, status } = req.query as Record<string, string>;
    if (status === 'success' && tx_ref) {
      const verify = await paymentService.verify(tx_ref);
      if (verify.success && verify.status === 'complete') {
        res.redirect('/profile?payment=success');
        return;
      }
    }
    res.redirect('/profile?payment=failed');
  }),

  webhook: asyncHandler(async (req: Request, res: Response) => {
    await paymentService.processWebhook(req.body);
    res.json({ success: true });
  }),

  recordManual: asyncHandler(async (req: Request, res: Response) => {
    const updated = await paymentService.recordManualPayment(req.params.id, {
      depositAmount: req.body.depositAmount,
      paymentMethod: req.body.paymentMethod || 'bank_transfer',
      note: req.body.note,
    });
    res.json({ success: true, request: updated });
  }),
};
