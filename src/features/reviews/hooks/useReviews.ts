import { useState, useCallback } from 'react';
import { useToast } from '../../../shared/ui/Toast';
import type { ReviewItem } from '../../admin/components/types';

export function useReviews() {
  const { showToast } = useToast();
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (data.success) setReviewItems(data.reviews || []);
    } catch (e) { /* ignore */ }
    finally { setReviewsLoading(false); }
  }, []);

  const handleDeleteReview = useCallback(async (id: string, author: string) => {
    if (!window.confirm(`Delete review by ${author}? This cannot be undone.`)) return false;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      const data = await res.json();
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
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, rating }),
      });
      const data = await res.json();
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
