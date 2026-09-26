import { useQuery } from '@tanstack/react-query';
import { http } from '@client/lib/http';
import { queryKeys } from '@client/lib/queryKeys';
import type { ApiResponse } from '@/shared/api';
import type { Review } from '@shared/types';

export type { Review as ReviewItem } from '@shared/types';

function fetchCompanyReviews(): Promise<Review[]> {
  return http.get<ApiResponse<{ reviews: Review[] }>>('/api/reviews')
    .then(({ data }) => {
      if (data.success) return data.reviews ?? [];
      throw new Error(data.error);
    });
}

function fetchProductReviews(productId: string): Promise<Review[]> {
  return http.get<ApiResponse<{ reviews: Review[] }>>(`/api/products/${productId}/reviews`)
    .then(({ data }) => {
      if (data.success) return data.reviews ?? [];
      throw new Error(data.error);
    });
}

// Company reviews (testimonials) - general bakery tributes
export function useCompanyReviews() {
  return useQuery({
    queryKey: [...queryKeys.reviews.all, 'company'],
    queryFn: fetchCompanyReviews,
  });
}

// Product reviews - nested under specific product
export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: [...queryKeys.reviews.all, 'product', productId],
    queryFn: () => fetchProductReviews(productId),
    enabled: !!productId,
  });
}

// Legacy hook for backwards compatibility
export function useReviews() {
  const { data: reviews = [], isLoading, error } = useCompanyReviews();
  return { reviews, isLoading, error };
}
