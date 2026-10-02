export interface OrderConversation {
  step: string;
  userId: string;
  contactName: string;
  contactPhone: string;
  eventType?: string;
  eventDate?: string;
  guestCount?: number;
  flavor?: string;
  designStyle?: string;
  tierCount?: number;
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderWizardStep =
  | 'eventType'
  | 'eventDate'
  | 'guestCount'
  | 'flavor'
  | 'tierCount'
  | 'designStyle'
  | 'contactPhone'
  | 'specialInstructions';
