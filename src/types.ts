export type PageType =
    | "home"
    | "gallery"
    | "request"
    | "about"
    | "testimonials"
    | "contact"
    | "orders"
    | "admin"
    | "auth"
    | "profile"
    | "not-found";

export interface User {
  id: string;
  name: string;
  role: 'customer' | 'admin' | 'staff';
  createdAt: string;
  telegramId: string;
  telegramUsername?: string | null;
  telegramPhoto?: string | null;
  notifyViaTelegram?: boolean;
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
}

export interface CakeGalleryItem {
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
}

export interface CustomCakeRequest {
  id: string;
  contactName: string;
  contactPhone: string;
  eventType: string;
  guestCount: number;
  deliveryOption: 'pickup' | 'delivery';
  deliveryAddress?: string;
  deliveryDate: string;
  designStyle: string;
  flavor: string;
  tierCount: number;
  specialInstructions: string;
  requestDate: string;
  referenceImage?: string;
  status: 'Received' | 'Designing' | 'Quoted' | 'Confirmed' | 'InProgress' | 'Ready' | 'Completed' | 'Cancelled';
  quotedPrice?: number;
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

export interface Testimonial {
    id: string;
    author: string;
    eventType: string;
    role: string;
    content: string;
    rating: number;
    image: string;
    date: string;
    featured?: boolean;
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
