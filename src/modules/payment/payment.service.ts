import { paymentConfig } from './payment.config.js';
import { getPrisma } from '../../app/config/prisma.js';
import { calculatePaymentState } from '../orders/orders.workflow.js';
import type { InitiatePaymentInput, InitiatePaymentResult, VerifyPaymentResult } from './payment.types.js';

function generateRef(): string {
  return `FB-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export const paymentService = {
  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    const prisma = getPrisma();
    const order = await prisma.customCakeRequest.findUnique({ where: { id: input.orderId } });
    if (!order) return { success: false, message: 'Order not found.' };
    if (!order.finalPrice && !order.quotedPrice) return { success: false, message: 'No price set for this order.' };

    const amount = order.remainingBalance > 0 ? order.remainingBalance : (order.finalPrice ?? order.quotedPrice ?? 0);
    if (amount <= 0) return { success: false, message: 'Order is already fully paid.' };

    const txRef = generateRef();

    if (paymentConfig.isMockMode) {
      const checkoutUrl = `/mock-checkout?ref=${txRef}&amount=${amount}&order=${order.id}`;
      return { success: true, checkoutUrl, transactionRef: txRef };
    }

    try {
      const firstName = input.firstName || order.contactName.split(' ')[0] || 'Customer';
      const lastName = input.lastName || order.contactName.split(' ').slice(1).join(' ') || '';
      const email = input.email || `${order.contactName.replace(/\s+/g, '').toLowerCase()}@email.com`;

      const body = {
        amount: String(amount),
        currency: input.currency || 'ETB',
        email,
        first_name: firstName,
        last_name: lastName,
        phone: input.phone || order.contactPhone,
        tx_ref: txRef,
        callback_url: `${paymentConfig.getBaseUrl()}/api/payments/callback`,
        return_url: `${paymentConfig.getBaseUrl()}/profile`,
        customization: { title: `Flavour Bites - ${order.eventType} Cake` },
      };

      const res = await fetch(`${paymentConfig.chapaApiUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paymentConfig.chapaSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.status === 'success' && json.data?.checkout_url) {
        return { success: true, checkoutUrl: json.data.checkout_url, transactionRef: txRef };
      }
      return { success: false, message: json.message || 'Chapa initiation failed.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Payment initiation error.' };
    }
  },

  async verify(txRef: string): Promise<VerifyPaymentResult> {
    if (paymentConfig.isMockMode) {
      return { success: true, status: 'complete', amount: 0, currency: 'ETB' };
    }

    try {
      const res = await fetch(`${paymentConfig.chapaApiUrl}/transaction/verify/${txRef}`, {
        headers: { Authorization: `Bearer ${paymentConfig.chapaSecretKey}` },
      });
      const json = await res.json();
      if (json.status === 'success' && json.data) {
        const chapaStatus = json.data.status;
        const status: 'complete' | 'pending' | 'failed' =
          chapaStatus === 'success' ? 'complete' :
          chapaStatus === 'pending' ? 'pending' : 'failed';
        return { success: true, status, amount: json.data.amount, currency: json.data.currency };
      }
      return { success: false, status: 'failed' };
    } catch {
      return { success: false, status: 'failed' };
    }
  },

  async processWebhook(body: Record<string, unknown>): Promise<void> {
    const txRef = body.tx_ref as string | undefined;
    const chapaStatus = body.status as string | undefined;
    if (!txRef || chapaStatus !== 'success') return;

    const prisma = getPrisma();
    const order = await prisma.customCakeRequest.findFirst({
      where: { id: { startsWith: txRef.split('-').slice(0, -1).join('-') } },
    });
    if (!order) return;

    const amount = body.amount ? Number(body.amount) : 0;
    const depositAmount = (order.depositAmount || 0) + amount;
    const state = calculatePaymentState({ finalPrice: order.finalPrice ?? order.quotedPrice ?? 0, depositAmount });
    const finalPrice = order.finalPrice ?? order.quotedPrice ?? 0;

    await getPrisma().customCakeRequest.update({
      where: { id: order.id },
      data: {
        depositAmount: state.depositAmount || amount,
        remainingBalance: Math.max(finalPrice - (state.depositAmount || amount), 0),
        paymentStatus: state.paymentStatus,
        depositPaidAt: new Date(),
      },
    });
  },

  async recordManualPayment(orderId: string, input: { depositAmount: number; paymentMethod?: string; note?: string }) {
    const prisma = getPrisma();
    const order = await prisma.customCakeRequest.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found.');

    const finalPrice = order.finalPrice ?? order.quotedPrice ?? 0;
    const newDeposit = (order.depositAmount || 0) + input.depositAmount;
    const state = calculatePaymentState({ finalPrice, depositAmount: newDeposit });

    const updated = await prisma.customCakeRequest.update({
      where: { id: orderId },
      data: {
        depositAmount: state.depositAmount,
        remainingBalance: state.remainingBalance,
        paymentStatus: state.paymentStatus,
        depositPaidAt: state.depositAmount > 0 && !order.depositPaidAt ? new Date() : order.depositPaidAt,
      },
    });

    if (input.note) {
      await prisma.orderStatusEvent.create({
        data: {
          id: `pay-${Date.now()}`,
          orderId,
          toStatus: updated.status,
          source: 'admin_api',
          note: `Payment recorded: ${input.depositAmount} ETB via ${input.paymentMethod || 'manual'}. ${input.note || ''}`.trim(),
        },
      });
    }

    return updated;
  },
};
