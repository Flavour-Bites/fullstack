export type OrderActorSource = 'admin_api' | 'staff_api' | 'customer_api' | 'telegram_bot' | 'system';

export type OrderActor = {
  userId?: string | null;
  source: OrderActorSource;
  note?: string | null;
};
