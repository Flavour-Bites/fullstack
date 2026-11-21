import { useQuery } from '@tanstack/react-query';
import type { OrderStatusEvent } from '@shared/types';
import { apiGet } from '@client/lib/http';
import { queryKeys } from '@client/lib/queryKeys';

// Real per-order progress history (status change events recorded server-side).
// Enabled only once an order is selected, and cached per order id so revisiting
// a previously opened order never refetches.
export function useOrderTimeline(orderId: string | null) {
  return useQuery({
    queryKey: orderId ? queryKeys.orders.timeline(orderId) : ['orders', 'timeline'],
    queryFn: async () => (await apiGet<{ events: OrderStatusEvent[] }>(`/api/requests/${orderId}/timeline`)).events,
    enabled: Boolean(orderId),
    staleTime: 15_000,
  });
}