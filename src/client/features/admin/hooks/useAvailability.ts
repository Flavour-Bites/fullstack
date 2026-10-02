import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@client/lib/http';
import type { AvailabilityResponse, AvailabilityPolicy } from '@shared/types';

async function fetchAvailability(): Promise<AvailabilityResponse> {
  const { data } = await http.get<{ success: boolean; error?: string; data?: AvailabilityResponse }>('/api/availability');
  if (!data.success) throw new Error(data.error || 'Failed to fetch availability');
  if (!data.data) throw new Error('No availability data returned');
  return data.data;
}

async function updateAvailability(input: Partial<AvailabilityPolicy>): Promise<AvailabilityResponse> {
  const { data } = await http.patch<{ success: boolean; error?: string; data?: AvailabilityResponse }>('/api/availability', input);
  if (!data.success) throw new Error(data.error || 'Failed to update availability');
  if (!data.data) throw new Error('No availability data returned');
  return data.data;
}

export function useAvailability() {
  return useQuery({
    queryKey: ['availability'],
    queryFn: fetchAvailability,
  });
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: Partial<AvailabilityPolicy>) => updateAvailability(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}