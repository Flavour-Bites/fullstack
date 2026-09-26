import { ordersRepository } from './orders.repository';
import { makeOrderId } from '../../../shared/utils/ids';
import { formatRequestDate } from '../../../shared/utils/dateFormat';
import { normalizeMoney, isValidTransition } from './orders.workflow';
import { notifyStaffNewOrder, notifyCustomerStatusChange, notifyStaffPriceConfirmed } from '../../platform/integrations/telegram/telegramNotifications';
import { NotFoundError, ValidationError, AuthorizationError } from '../../platform/errors/index';
import type { OrderStatus } from '@prisma/client';
import type { OrderActor, OrderUpdateInput } from './orders.types';

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
  }, userId: string) {
    const orderData = {
      id: makeOrderId(),
      userId,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      eventType: data.eventType,
      guestCount: data.guestCount,
      eventDate: data.eventDate,
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
      source: 'customer_api',
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

    if (input.status !== undefined) {
      if (!isValidTransition(current.status, input.status)) {
        throw new ValidationError(`Cannot change status from ${current.status} to ${input.status}.`);
      }
      updated = await this.changeStatus(orderId, input.status, {
        userId: actor.userId,
        source: actor.source,
        note: input.note ?? null,
      });
    } else if (
      input.price !== undefined &&
      (current.status === 'Received' || current.status === 'Designing')
    ) {
      updated = await this.changeStatus(orderId, 'Priced', {
        userId: actor.userId,
        source: actor.source,
        note: 'Cake price was set.',
      });
    }

    return updated;
  },

  async updateCommercials(
    orderId: string,
    data: Record<string, unknown>,
    predefinedCommercials?: Record<string, number | Date | null>,
  ) {
    const moneyFields = ['price', 'finalPrice', 'depositAmount'] as const;
    const commercialInput: Record<string, number | Date | null> = { ...predefinedCommercials };

    if (!predefinedCommercials) {
      for (const field of moneyFields) {
        if (field in data) {
          const value = normalizeMoney(data[field]);
          if (value === null) throw new ValidationError('Please enter a valid amount.');
          commercialInput[field] = value;
        }
      }
    }

    if ('depositPaidAt' in data) {
      commercialInput.depositPaidAt = data.depositPaidAt ? new Date(data.depositPaidAt as string) : null;
    }
    if ('priceConfirmedAt' in data) {
      commercialInput.priceConfirmedAt = data.priceConfirmedAt ? new Date(data.priceConfirmedAt as string) : null;
    }

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

  async acceptPrice(orderId: string, userId: string, role: string) {
    const order = await ordersRepository.findById(orderId);
    if (!order || order.deletedAt) throw new NotFoundError('Order not found.');
    if (role === 'customer' && order.userId !== userId) {
      throw new AuthorizationError('You can only confirm your own cake order.');
    }
    if (!order.price) throw new ValidationError('Cake price is not ready yet.');

    await ordersRepository.updateCommercials(orderId, {
      finalPrice: order.finalPrice ?? order.price,
      priceConfirmedAt: new Date(),
    });

    const updated = await ordersRepository.updateStatus(orderId, 'Confirmed', {
      userId,
      source: role === 'customer' ? 'customer_api' : 'staff_api',
      note: 'Cake price confirmed.',
    });

    notifyCustomerStatusChange(orderId).catch((err: Error) =>
      console.error('[Notify] Customer notice failed:', err.message),
    );
    notifyStaffPriceConfirmed(updated as any).catch((err: Error) =>
      console.error('[Notify] Staff price-confirmed notice failed:', err.message),
    );

    return updated;
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
