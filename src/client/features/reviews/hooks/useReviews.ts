import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useOptionalToast } from '@client/components/Toast';
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

// Unified hook providing data and admin management
export function useReviews() {
  const queryClient = useQueryClient();
  const toast = useOptionalToast();
  const { data: reviews = [], isLoading, error, refetch } = useCompanyReviews();

  const handleDeleteReview = useCallback(async (id: string, author: string) => {
    if (!window.confirm(`Delete review by ${author}? This cannot be undone.`)) return false;
    try {
      const { data } = await http.delete<ApiResponse>(`/api/reviews/${id}`);
      if (data.success) {
        toast?.showToast('Review Deleted', `Review by ${author} removed.`, 'warning');
        queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
        return true;
      }
      throw new Error(data.error);
    } catch (e: any) {
      toast?.showToast('Delete Failed', e.message, 'error');
    }
    return false;
  }, [queryClient, toast]);

  return {
    reviews,
    isLoading,
    error,
    refetch,
    // Admin compatibility aliases
    reviewItems: reviews,
    reviewsLoading: isLoading,
    fetchReviews: async () => {
      await refetch();
    },
    handleDeleteReview,
  };
}
