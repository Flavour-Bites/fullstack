import { useQuery } from '@tanstack/react-query';
import type { Review } from '@shared/types';
import { apiGet } from '@client/lib/http';

// Public client reviews. React Query caches the list for the testimonials
// page and the home carousel; admin mutations invalidate the ['reviews'] key
// so published changes appear immediately.
export function useTestimonials() {
  return useQuery({
    queryKey: ['reviews'],
    queryFn: async () => (await apiGet<{ reviews: Review[] }>('/api/reviews')).reviews,
  });
}