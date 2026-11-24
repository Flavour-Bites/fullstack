import { ordersRepository } from './orders.repository';
import { makeOrderId } from '../../../shared/utils/ids';
import { formatRequestDate } from '../../../shared/utils/dateFormat';
import { normalizeMoney, isValidTransition } from './orders.workflow';
import { businessAvailabilityService } from '../business/businessAvailability.service';
import { notifyStaffNewOrder, notifyCustomerStatusChange, notifyStaffPriceConfirmed } from '../../platform/integrations/telegram/telegramNotifications';
import { NotFoundError, ValidationError, AuthorizationError } from '../../platform/errors/index';
import type { OrderStatus } from '@prisma/client';
import type { OrderActor, OrderUpdateInput } from './orders.types';

function parseMoneyCommercials(data: Record<string, unknown>): Record<string, number> {
  const moneyFields = ['price', 'finalPrice', 'depositAmount'] as const;
  const result: Record<string, number> = {};
  for (const field of moneyFields) {
    if (field in data) {
      const value = normalizeMoney(data[field]);
      if (value === null) throw new ValidationError('Please enter a valid amount.');
      result[field] = value;
    }
  }
  return result;
}

function parseDateCommercials(data: Record<string, unknown>): Record<string, Date | null> {
  const result: Record<string, Date | null> = {};
  if ('depositPaidAt' in data) {
    result.depositPaidAt = data.depositPaidAt ? new Date(data.depositPaidAt as string) : null;
  }
  if ('priceConfirmedAt' in data) {
    result.priceConfirmedAt = data.priceConfirmedAt ? new Date(data.priceConfirmedAt as string) : null;
  }
  return result;
}

export const ordersService = {
  async create(data: {
    contactName: string;
    contactPhone: string;
    eventType: string;
    guestCount: number;
    eventDate: string;
    designStyle?: string | null;
    flavor: string;
    tierCount: number;
    specialInstructions?: string | null;
    referenceImage?: string | null;
    referenceImagePublicId?: string | null;
    referenceImageFormat?: string | null;
    referenceImageBytes?: number | null;
    requestDate?: string;
  }, userId: string, source: OrderActor['source'] = 'customer_api') {
    const validation = await businessAvailabilityService.validateOrderDate(data.eventDate);
    if (!validation.valid) {
      throw new ValidationError(validation.error || 'The selected date is not available.');
    }

    const orderData = {
      id: makeOrderId(),
      userId,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      eventType: data.eventType,
      guestCount: data.guestCount,
      eventDate: validation.normalizedDate ?? data.eventDate,
      designStyle: data.designStyle ?? '',
      flavor: data.flavor,
      tierCount: data.tierCount,
      specialInstructions: data.specialInstructions ?? '',
      referenceImage: data.referenceImage ?? null,
      referenceImagePublicId: data.referenceImagePublicId ?? null,
      referenceImageFormat: data.referenceImageFormat ?? null,
      referenceImageBytes: data.referenceImageBytes ?? null,
      requestDate: data.requestDate || formatRequestDate(),
    };

    const order = await ordersRepository.create(orderData, {
      userId,
      source,
    });

    notifyStaffNewOrder(order).catch((err: Error) =>
      console.error('[Notify] Staff order notice failed:', err.message),
    );

    return order;
  },

  async findAll(params: { includeDeleted?: boolean; userId?: string; role?: string }) {
    return ordersRepository.findMany(
      params.includeDeleted || false,
      params.userId,
      params.role,
    );
  },

  async findById(id: string) {
    return ordersRepository.findById(id);
  },

  async update(orderId: string, input: OrderUpdateInput, actor: OrderActor) {
    const current = await ordersRepository.findById(orderId);
    if (!current || current.deletedAt) {
      throw new NotFoundError('Order not found.');
    }

    // Determine target status (if any) and validate transition BEFORE making any database updates
    let targetStatus: OrderStatus | undefined = input.status;
    if (
      targetStatus === undefined &&
      input.price !== undefined &&
      (current.status === 'Received' || current.status === 'Designing')
    ) {
      targetStatus = 'Priced';
    }

    if (targetStatus !== undefined && !isValidTransition(current.status, targetStatus)) {
      throw new ValidationError(`Cannot change status from ${current.status} to ${targetStatus}.`);
    }

    let updated = current;

    const commercialResult = await this.updateCommercials(orderId, input as Record<string, unknown>);
    if (commercialResult) updated = commercialResult;

    if (
      input.designStyle !== undefined ||
      input.specialInstructions !== undefined ||
      input.bakerNote !== undefined
    ) {
      updated = await this.updateDesignAndNotes(orderId, input);
    }

    if (targetStatus !== undefined) {
      const note = input.status !== undefined ? (input.note ?? null) : 'Cake price was set.';
      updated = await this.changeStatus(orderId, targetStatus, {
        userId: actor.userId,
        source: actor.source,
        note,
      });
    }

    return updated;
  },

  async updateCommercials(
    orderId: string,
    data: Record<string, unknown>,
    predefinedCommercials?: Record<string, number | Date | null>,
  ) {
    const commercialInput: Record<string, number | Date | null> = {
      ...(predefinedCommercials ?? parseMoneyCommercials(data)),
      ...parseDateCommercials(data),
    };

    if (Object.keys(commercialInput).length === 0) return null;

    return ordersRepository.updateCommercials(orderId, commercialInput as any);
  },

  async updateDesignAndNotes(
    orderId: string,
    data: { designStyle?: string; specialInstructions?: string; bakerNote?: string },
  ) {
    return ordersRepository.updateDesignAndNotes(orderId, data);
  },

  async changeStatus(
    orderId: string,
    status: OrderStatus,
    actor: OrderActor,
  ) {
    const updated = await ordersRepository.updateStatus(orderId, status, actor);
    notifyCustomerStatusChange(orderId).catch((err: Error) =>
      console.error('[Notify] Customer notice failed:', err.message),
    );
    return updated;
  },

  async acceptPrice(
    orderId: string,
    userId: string,
    role: string,
    source?: OrderActor['source']
  ) {
    const order = await ordersRepository.findById(orderId);
    if (!order || order.deletedAt) throw new NotFoundError('Order not found.');
    if (role === 'customer' && order.userId !== userId) {
      throw new AuthorizationError('You can only confirm your own cake order.');
    }
    if (order.status !== 'Priced') {
      throw new ValidationError(`Order is currently in "${order.status}" status and cannot be confirmed.`);
    }
    if (!order.price) throw new ValidationError('Cake price is not ready yet.');

    const updated = await ordersRepository.acceptPrice(
      orderId,
      {
        finalPrice: order.finalPrice ?? order.price,
        priceConfirmedAt: new Date(),
      },
      {
        userId,
        source: source ?? (role === 'customer' ? 'customer_api' : 'staff_api'),
        note: 'Cake price confirmed.',
      }
    );

    if (!updated) {
      throw new NotFoundError('Order not found.');
    }

    notifyCustomerStatusChange(orderId).catch((err: Error) =>
      console.error('[Notify] Customer notice failed:', err.message),
    );
    notifyStaffPriceConfirmed(updated as any).catch((err: Error) =>
      console.error('[Notify] Staff price-confirmed notice failed:', err.message),
    );

    return updated;
  },

  async findActiveByUserId(userId: string, limit = 5) {
    return ordersRepository.findActiveByUserId(userId, limit);
  },

  async search(query: string, limit = 30) {
    return ordersRepository.search(query, limit);
  },

  async searchForStaff(query: string, actor: { id: string; role: string }, limit = 30) {
    if (actor.role !== 'staff' && actor.role !== 'admin') {
      return [];
    }
    return ordersRepository.search(query, limit);
  },

  async findByIdForUser(orderId: string, actor: { id: string; role: string }) {
    const order = await ordersRepository.findById(orderId);
    if (!order || order.deletedAt) return null;
    if (actor.role === 'staff' || actor.role === 'admin') {
      return order;
    }
    if (order.userId === actor.id) {
      return order;
    }
    return null;
  },

  async softDelete(orderId: string) {
    return ordersRepository.softDelete(orderId);
  },

  async updateAll(orderId: string, fields: Record<string, unknown>) {
    return ordersRepository.updateFull(orderId, fields);
  },

  async restore(orderId: string) {
    return ordersRepository.restore(orderId);
  },

  async getTimeline(orderId: string) {
    return ordersRepository.findStatusEvents(orderId);
  },
};
