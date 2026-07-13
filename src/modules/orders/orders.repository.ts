import { getPrisma } from '../../app/config/prisma.js';
import { makeId } from '../../shared/utils/ids.js';
import type { OrderStatus, PaymentStatus } from '@prisma/client';
import type { OrderActor } from './orders.types.js';
import { ORDER_WORKFLOW, calculatePaymentState } from './orders.workflow.js';

export const ordersRepository = {
  async create(data: {
    id: string;
    userId: string;
    contactName: string;
    contactPhone: string;
    eventType: string;
    guestCount: number;
    deliveryOption: string;
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
    requestDate: string;
  }) {
    const prisma = getPrisma();
    return prisma.customCakeRequest.create({
      data: {
        id: data.id,
        userId: data.userId,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        eventType: data.eventType,
        guestCount: data.guestCount,
        deliveryOption: data.deliveryOption,
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
        requestDate: data.requestDate,
        status: 'Received',
        remainingBalance: 0,
        paymentStatus: 'unpaid',
      },
      include: { user: true },
    });
  },

  async findById(id: string) {
    const prisma = getPrisma();
    return prisma.customCakeRequest.findUnique({ where: { id } });
  },

  async findMany(
    where: Record<string, unknown> = {},
    includeDeleted = false,
    userId?: string,
    role?: string,
  ) {
    const prisma = getPrisma();
    const baseWhere = includeDeleted
      ? role === 'customer'
        ? { userId }
        : {}
      : { deletedAt: null, ...(role === 'customer' ? { userId } : {}) };

    return prisma.customCakeRequest.findMany({
      where: baseWhere,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateStatus(
    orderId: string,
    toStatus: OrderStatus,
    actor: OrderActor,
  ) {
    const prisma = getPrisma();
    return prisma.$transaction(async (tx) => {
      const current = await tx.customCakeRequest.findUnique({
        where: { id: orderId },
        select: { id: true, status: true, deletedAt: true },
      });

      if (!current || current.deletedAt) {
        throw new Error('Order not found.');
      }

      if (current.status === toStatus) {
        return tx.customCakeRequest.findUnique({
          where: { id: orderId },
          include: { user: true },
        });
      }

      const updated = await tx.customCakeRequest.update({
        where: { id: orderId },
        data: { status: toStatus },
        include: { user: true },
      });

      await tx.orderStatusEvent.create({
        data: {
          id: makeId('ose'),
          orderId,
          fromStatus: current.status,
          toStatus,
          changedById: actor.userId ?? null,
          source: actor.source,
          note: actor.note ?? null,
        },
      });

      return updated;
    });
  },

  async updateCommercials(
    orderId: string,
    input: {
      quotedPrice?: number | null;
      finalPrice?: number | null;
      depositAmount?: number | null;
      depositPaidAt?: Date | null;
      priceConfirmedAt?: Date | null;
    },
  ) {
    const prisma = getPrisma();
    return prisma.$transaction(async (tx) => {
      const current = await tx.customCakeRequest.findUnique({
        where: { id: orderId },
        select: { finalPrice: true, depositAmount: true, deletedAt: true },
      });
      if (!current || current.deletedAt) throw new Error('Order not found.');

      const nextFinalPrice =
        input.finalPrice !== undefined
          ? input.finalPrice
          : current.finalPrice;
      const nextDeposit =
        input.depositAmount !== undefined
          ? input.depositAmount
          : current.depositAmount;
      const payment = calculatePaymentState({
        finalPrice: nextFinalPrice ?? 0,
        depositAmount: nextDeposit ?? 0,
      });
      const paymentStatus = payment.paymentStatus as PaymentStatus;

      return tx.customCakeRequest.update({
        where: { id: orderId },
        data: {
          ...(input.quotedPrice !== undefined ? { quotedPrice: input.quotedPrice } : {}),
          ...(input.finalPrice !== undefined ? { finalPrice: input.finalPrice } : {}),
          ...(input.priceConfirmedAt !== undefined ? { priceConfirmedAt: input.priceConfirmedAt } : {}),
          ...(input.depositPaidAt !== undefined ? { depositPaidAt: input.depositPaidAt } : {}),
          depositAmount: payment.depositAmount,
          remainingBalance: payment.remainingBalance,
          paymentStatus,
        },
      });
    });
  },

  async updateDesignAndNotes(
    orderId: string,
    data: { designStyle?: string; specialInstructions?: string; bakerNote?: string },
  ) {
    const prisma = getPrisma();
    return prisma.customCakeRequest.update({
      where: { id: orderId },
      data: {
        ...(data.designStyle !== undefined ? { designStyle: String(data.designStyle) } : {}),
        ...(data.specialInstructions !== undefined ? { specialInstructions: String(data.specialInstructions) } : {}),
        ...(data.bakerNote !== undefined ? { bakerNote: String(data.bakerNote) } : {}),
      },
    });
  },

  async softDelete(orderId: string) {
    const prisma = getPrisma();
    return prisma.customCakeRequest.update({
      where: { id: orderId },
      data: { deletedAt: new Date() },
    });
  },

  async restore(orderId: string) {
    const prisma = getPrisma();
    return prisma.customCakeRequest.update({
      where: { id: orderId },
      data: { deletedAt: null },
    });
  },

  async findStatusEvents(orderId: string) {
    const prisma = getPrisma();
    return prisma.orderStatusEvent.findMany({
      where: { orderId },
      include: {
        changedBy: { select: { id: true, name: true, role: true, telegramUsername: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  },
};
