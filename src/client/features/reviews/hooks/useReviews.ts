import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../components/Toast';
import { http } from '@client/lib/http';
import { queryKeys } from '@client/lib/queryKeys';
import type { ApiResponse } from '@/shared/api';
import type { ReviewItem } from '../../admin/types';

export function useReviews() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const { data } = await http.get<ApiResponse<{ reviews: ReviewItem[] }>>('/api/reviews');
      if (data.success) setReviewItems(data.reviews || []);
    } catch { /* ignore */ }
    finally { setReviewsLoading(false); }
  }, []);

  const handleDeleteReview = useCallback(async (id: string, author: string) => {
    if (!window.confirm(`Delete review by ${author}? This cannot be undone.`)) return false;
    try {
      const { data } = await http.delete<ApiResponse>(`/api/reviews/${id}`);
      if (data.success) {
        showToast('Review Deleted', `Review by ${author} removed.`, 'warning');
        queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
        fetchReviews();
        return true;
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Delete Failed', e.message, 'error'); }
    return false;
  }, [fetchReviews, queryClient, showToast]);

  return {
    reviewItems,
    reviewsLoading,
    fetchReviews,
    handleDeleteReview,
  };
}