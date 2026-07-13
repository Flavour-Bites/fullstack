export interface InitiatePaymentInput {
  orderId: string;
  amount?: number;
  currency?: 'ETB' | 'USD';
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface InitiatePaymentResult {
  success: boolean;
  checkoutUrl?: string;
  transactionRef?: string;
  message?: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  status: 'complete' | 'pending' | 'failed';
  amount?: number;
  currency?: string;
}

export interface RecordManualPaymentInput {
  depositAmount: number;
  paymentMethod?: string;
  note?: string;
}

export interface ChapaInitiateResponse {
  status: 'success' | 'failed';
  message: string;
  data?: {
    checkout_url: string;
    transaction_reference: string;
  };
}

export interface ChapaVerifyResponse {
  status: 'success' | 'failed';
  message: string;
  data?: {
    status: string;
    amount: number;
    currency: string;
  };
}
