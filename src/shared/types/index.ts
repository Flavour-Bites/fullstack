export interface User {
  id: string;
  name: string;
  role: 'customer' | 'admin' | 'staff';
  createdAt: string;
  telegramId: string;
  telegramUsername?: string | null;
  telegramPhoto?: string | null;
  notifyViaTelegram?: boolean;
  telegramBotWriteAccess?: boolean;
  telegramPhone?: string | null;
  dietaryPreferences?: string[];
  language?: string;
}

export interface Review {
  id: string;
  rating: number;
  content: string;
  author: string;
  eventType: string;
  role: string;
  userId?: string | null;
  productId?: string | null;
  date: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    telegramPhoto?: string | null;
  } | null;
}

export type CompanyReview = Review; // Reviews without productId (company/service testimonials)
export type ProductReview = Review; // Reviews with productId (product-specific reviews)

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  category?: { id: string; name: string; slug: string; color?: string | null; icon?: string | null };
  flavors: string[];
  priceEstimate: string;
  image: string;
  imagePublicId?: string | null;
  servingCount: string;
  tags: string[];
  isActive?: boolean;
}

export type OrderStatus = 'Received' | 'Designing' | 'Priced' | 'Confirmed' | 'InProgress' | 'Ready' | 'Completed' | 'Cancelled';

export interface CustomCakeRequest {
  id: string;
  contactName: string;
  contactPhone: string;
  eventType: string;
  guestCount: number;
  eventDate: string;
  designStyle: string;
  flavor: string;
  tierCount: number;
  specialInstructions: string;
  requestDate: string;
  referenceImage?: string;
  status: OrderStatus;
  price?: number;
  finalPrice?: number;
  priceConfirmedAt?: string;
  depositAmount: number;
  depositPaidAt?: string;
  remainingBalance: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  bakerNote?: string | null;
  user?: User;
  statusEvents?: OrderStatusEvent[];
}

export interface OrderStatusEvent {
  id: string;
  orderId: string;
  fromStatus?: string | null;
  toStatus: string;
  changedById?: string | null;
  changedBy?: { id: string; name: string; role: string; telegramUsername?: string | null } | null;
  source: string;
  note?: string | null;
  createdAt: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface IngredientSpotlight {
  name: string;
  origin: string;
  description: string;
  image: string;
}

export interface RequestForm {
  contactName: string;
  contactPhone: string;
  eventDate: string;
  cakeDescription: string;
}

export interface AvailabilityPolicy {
  isEnabled: boolean;
  timezone: string;
  minimumLeadTimeHours: number;
  mondayEnabled: boolean;
  tuesdayEnabled: boolean;
  wednesdayEnabled: boolean;
  thursdayEnabled: boolean;
  fridayEnabled: boolean;
  saturdayEnabled: boolean;
  sundayEnabled: boolean;
}

export interface AvailabilityResponse {
  isEnabled: boolean;
  timezone: string;
  minimumLeadTimeHours: number;
  days: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}
