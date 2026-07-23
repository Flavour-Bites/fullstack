import type { OrderStatus, PrismaClient } from '@prisma/client';
import { makeId } from '../../../shared/utils/ids';

export type OrderActor = {
  userId?: string | null;
  source: 'admin_api' | 'staff_api' | 'customer_api' | 'telegram_bot' | 'system';
  note?: string | null;
};

export async function createOrder(
  prisma: PrismaClient,
  data: {
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
  },
  actor: OrderActor,
) {
  const order = await prisma.customCakeRequest.create({
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
    },
    include: { user: true },
  });

  await prisma.orderStatusEvent.create({
    data: {
      id: makeId('ose'),
      orderId: order.id,
      fromStatus: null,
      toStatus: 'Received',
      changedById: actor.userId ?? null,
      source: actor.source,
      note: actor.note ?? null,
    },
  });

  return order;
}

export async function updateOrderStatus(
  prisma: PrismaClient,
  orderId: string,
  toStatus: OrderStatus,
  actor: OrderActor,
) {
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
}

export async function updateOrderCommercials(
  prisma: PrismaClient,
  orderId: string,
  input: {
    quotedPrice?: number | null;
    finalPrice?: number | null;
    depositAmount?: number | null;
    depositPaidAt?: Date | null;
    priceConfirmedAt?: Date | null;
  },
) {
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

    return tx.customCakeRequest.update({
      where: { id: orderId },
      data: {
        ...(input.quotedPrice !== undefined ? { quotedPrice: input.quotedPrice } : {}),
        ...(input.finalPrice !== undefined ? { finalPrice: input.finalPrice } : {}),
        ...(input.priceConfirmedAt !== undefined ? { priceConfirmedAt: input.priceConfirmedAt } : {}),
        ...(input.depositPaidAt !== undefined ? { depositPaidAt: input.depositPaidAt } : {}),
        depositAmount: nextDeposit,
        remainingBalance: Math.max((nextFinalPrice ?? 0) - (nextDeposit ?? 0), 0),
      },
    });
  });
}

export async function softDeleteOrder(prisma: PrismaClient, orderId: string) {
  return prisma.customCakeRequest.update({
    where: { id: orderId },
    data: { deletedAt: new Date() },
  });
}

export async function restoreOrder(prisma: PrismaClient, orderId: string) {
  return prisma.customCakeRequest.update({
    where: { id: orderId },
    data: { deletedAt: null },
  });
}
