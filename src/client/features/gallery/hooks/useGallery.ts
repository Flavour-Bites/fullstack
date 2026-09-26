import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../../components/Toast';
import { http } from '@client/lib/http';
import { queryKeys } from '@client/lib/queryKeys';
import type { ApiResponse } from '@/shared/api';

export function useGallery() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const invalidateGallery = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.gallery.all });
  }, [queryClient]);

  const handleSaveGalleryItem = useCallback(async (galleryForm: any, editingGalleryId: string | null) => {
    if (!galleryForm.name.trim() || !galleryForm.priceEstimate.trim()) {
      showToast('Validation', 'Name and price are required.', 'error'); return false;
    }
    try {
      const body: Record<string, unknown> = {
        name: galleryForm.name,
        description: galleryForm.description,
        categoryId: galleryForm.categoryId || undefined,
        flavors: galleryForm.flavors.split(',').map((f: string) => f.trim()).filter(Boolean),
        priceEstimate: galleryForm.priceEstimate,
        image: galleryForm.image || undefined,
        servingCount: galleryForm.servingCount || undefined,
        tags: galleryForm.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      };
      if (editingGalleryId) {
        const { data } = await http.patch<ApiResponse>(`/api/gallery/${editingGalleryId}`, body);
        if (data.success) {
          showToast('Gallery Item Updated', `"${galleryForm.name}" updated.`, 'success');
        } else throw new Error(data.error);
      } else {
        const { data } = await http.post<ApiResponse>('/api/gallery', body);
        if (data.success) {
          showToast('Gallery Item Created', `"${galleryForm.name}" added.`, 'success');
        } else throw new Error(data.error);
      }
      invalidateGallery();
      return true;
    } catch (e: any) { showToast('Failed', e.message, 'error'); }
    return false;
  }, [invalidateGallery]);

  const handleDeleteGalleryItem = useCallback(async (id: string, name: string) => {
    if (!window.confirm(`Delete gallery item "${name}"? This cannot be undone.`)) return false;
    try {
      const { data } = await http.delete<ApiResponse>(`/api/gallery/${id}`);
      if (data.success) {
        showToast('Gallery Item Deleted', `"${name}" removed.`, 'warning');
        invalidateGallery();
        return true;
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Delete Failed', e.message, 'error'); }
    return false;
  }, [invalidateGallery]);

  return {
    handleSaveGalleryItem,
    handleDeleteGalleryItem,
    invalidateGallery,
  };
}