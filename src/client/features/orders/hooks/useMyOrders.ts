import { useQuery, useQueryClient } from '@tanstack/react-query';
import { http } from '@client/lib/http';
import { queryKeys } from '@client/lib/queryKeys';
import { useOptionalToast } from '@client/components/Toast';
import type { ApiResponse } from '@/shared/api';
import type { CustomCakeRequest } from '@shared/types';

export function useMyOrders() {
  const queryClient = useQueryClient();
  const toast = useOptionalToast();

  const query = useQuery<CustomCakeRequest[]>({
    queryKey: queryKeys.orders.all,
    queryFn: async () => {
      const { data } = await http.get<ApiResponse<{ requests: CustomCakeRequest[] }>>('/api/requests');
      if (data.success) {
        return data.requests ?? [];
      }
      throw new Error(data.error || 'Failed to fetch orders');
    },
    staleTime: 30_000,
  });

  const cancelRequest = async (id: string) => {
    try {
      const { data } = await http.delete<ApiResponse>(`/api/requests/${id}`);
      if (data.success) {
        toast?.showToast('Request Cancelled', 'Your cake request has been cancelled.', 'info');
        await queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
        return true;
      }
      throw new Error(data.error || 'Failed to cancel request');
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || 'Unable to cancel request.';
      toast?.showToast('Cancellation Failed', msg, 'error');
      return false;
    }
  };

  return {
    requests: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    cancelRequest,
  };
}
