import { ordersRepository } from './orders.repository.js';
import { makeOrderId } from '../../shared/utils/ids.js';
import { formatRequestDate } from '../../shared/utils/dateFormat.js';
import { normalizeMoney } from './orders.workflow.js';
import { notifyStaffNewOrder, notifyCustomerStatusChange, notifyStaffQuoteAccepted } from '../../integrations/telegram/telegramNotifications.js';
import type { OrderStatus } from '@prisma/client';
import type { OrderActor } from './orders.types.js';

export const ordersService = {
  async create(data: {
    contactName: string;
    contactPhone: string;
    eventType: string;
    guestCount: number;
    deliveryOption?: string;
    deliveryAddress?: string | null;
    deliveryDate: string;
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
      deliveryOption: data.deliveryOption || 'pickup',
      deliveryAddress: data.deliveryAddress ?? null,
      deliveryDate: data.deliveryDate,
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

    const order = await ordersRepository.create(orderData);

    await ordersRepository.updateStatus(order.id, 'Received', {
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
      {},
      params.includeDeleted || false,
      params.userId,
      params.role,
    );
  },

  async findById(id: string) {
    return ordersRepository.findById(id);
  },

  async updateCommercials(
    orderId: string,
    data: Record<string, unknown>,
    predefinedCommercials?: Record<string, number | Date | null>,
  ) {
    const moneyFields = ['quotedPrice', 'finalPrice', 'depositAmount'] as const;
    const commercialInput: Record<string, number | Date | null> = { ...predefinedCommercials };

    if (!predefinedCommercials) {
      for (const field of moneyFields) {
        if (field in data) {
          const value = normalizeMoney(data[field]);
          if (value === null) throw new Error('Please enter a valid amount.');
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
    if (!order || order.deletedAt) throw new Error('Order not found.');
    if (role === 'customer' && order.userId !== userId) {
      throw new Error('You can only confirm your own cake order.');
    }
    if (!order.quotedPrice) throw new Error('Cake price is not ready yet.');

    await ordersRepository.updateCommercials(orderId, {
      finalPrice: order.finalPrice ?? order.quotedPrice,
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
    notifyStaffQuoteAccepted(updated as any).catch((err: Error) =>
      console.error('[Notify] Staff quote-accepted notice failed:', err.message),
    );

    return updated;
  },

  async softDelete(orderId: string) {
    return ordersRepository.softDelete(orderId);
  },

  async restore(orderId: string) {
    return ordersRepository.restore(orderId);
  },

  async getTimeline(orderId: string) {
    return ordersRepository.findStatusEvents(orderId);
  },
};
