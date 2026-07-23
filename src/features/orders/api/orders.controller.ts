import { Request, Response } from 'express';
import { ordersService } from './orders.service';
import { asyncHandler } from '../../../app/middleware/asyncHandler';
import { isValidTransition } from './orders.workflow';
import type { OrderStatus } from '@prisma/client';

export const ordersController = {
  findAll: asyncHandler(async (req: Request, res: Response) => {
    const includeDeleted = req.query.includeDeleted === 'true' && req.user!.role !== 'customer';
    const requests = await ordersService.findAll({
      includeDeleted,
      userId: req.user!.userId,
      role: req.user!.role,
    });
    res.json({ success: true, requests });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const order = await ordersService.create(req.body, req.user!.userId);
    res.json({ success: true, request: order });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const current = await ordersService.findById(id);
    if (!current || current.deletedAt) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }

    let updated = current;

    const commercialResult = await ordersService.updateCommercials(id, req.body);
    if (commercialResult) updated = commercialResult;

    if (req.body.designStyle !== undefined || req.body.specialInstructions !== undefined || req.body.bakerNote !== undefined) {
      updated = await ordersService.updateDesignAndNotes(id, req.body);
    }

    if (req.body.status !== undefined) {
      const status = req.body.status as OrderStatus;
      if (!isValidTransition(current.status, status)) {
        res.status(400).json({
          success: false,
          error: `Cannot change status from ${current.status} to ${status}.`,
        });
        return;
      }
      updated = await ordersService.changeStatus(id, status, {
        userId: req.user!.userId,
        source: req.user!.role === 'admin' ? 'admin_api' : 'staff_api',
        note: req.body.note ?? null,
      });
    } else if (req.body.quotedPrice !== undefined && current.status !== 'Quoted') {
      updated = await ordersService.changeStatus(id, 'Quoted', {
        userId: req.user!.userId,
        source: req.user!.role === 'admin' ? 'admin_api' : 'staff_api',
        note: 'Cake price was set.',
      });
    }

    res.json({ success: true, request: updated });
  }),

  acceptPrice: asyncHandler(async (req: Request, res: Response) => {
    const updated = await ordersService.acceptPrice(
      req.params.id,
      req.user!.userId,
      req.user!.role,
    );
    res.json({ success: true, request: updated });
  }),

  softDelete: asyncHandler(async (req: Request, res: Response) => {
    const order = await ordersService.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }
    if (order.deletedAt) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }
    await ordersService.softDelete(req.params.id);
    res.json({ success: true });
  }),

  restore: asyncHandler(async (req: Request, res: Response) => {
    const order = await ordersService.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }
    const restored = await ordersService.restore(req.params.id);
    res.json({ success: true, request: restored });
  }),

  timeline: asyncHandler(async (req: Request, res: Response) => {
    const order = await ordersService.findById(req.params.id);
    if (!order || (req.user!.role === 'customer' && order.userId !== req.user!.userId)) {
      res.status(404).json({ success: false, error: 'Order not found.' });
      return;
    }
    const events = await ordersService.getTimeline(req.params.id);
    res.json({ success: true, events });
  }),
};
