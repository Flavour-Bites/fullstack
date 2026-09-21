import { useState, useCallback } from 'react';
import { useToast } from '../../../components/Toast';
import { http } from '@client/lib/http';
import type { ApiResponse } from '@/shared/api';
import type { ReviewItem } from '../../admin/components/types';

export function useReviews() {
  const { showToast } = useToast();
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const { data } = await http.get<ApiResponse<{ reviews: ReviewItem[] }>>('/api/reviews');
      if (data.success) setReviewItems(data.reviews || []);
    } catch (e) { /* ignore */ }
    finally { setReviewsLoading(false); }
  }, []);

  const handleDeleteReview = useCallback(async (id: string, author: string) => {
    if (!window.confirm(`Delete review by ${author}? This cannot be undone.`)) return false;
    try {
      const { data } = await http.delete<ApiResponse>(`/api/reviews/${id}`);
      if (data.success) {
        showToast('Review Deleted', `Review by ${author} removed.`, 'warning');
        fetchReviews();
        return true;
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Delete Failed', e.message, 'error'); }
    return false;
  }, []);

  const handleSaveReview = useCallback(async (id: string, content: string, rating: number) => {
    try {
      const { data } = await http.patch<ApiResponse>(`/api/reviews/${id}`, { content, rating });
      if (data.success) {
        showToast('Review Updated', 'Review updated successfully.', 'success');
        fetchReviews();
        return true;
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Update Failed', e.message, 'error'); }
    return false;
  }, []);

  return {
    reviewItems,
    reviewsLoading,
    fetchReviews,
    handleDeleteReview,
    handleSaveReview,
  };
}