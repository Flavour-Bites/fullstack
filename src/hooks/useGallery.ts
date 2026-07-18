import { useState, useCallback } from 'react';
import { useToast } from '../components/Toast';

export function useGallery() {
  const { showToast } = useToast();
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  const fetchGallery = useCallback(async () => {
    setGalleryLoading(true);
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      if (data.success) setGalleryItems(data.items || []);
    } catch (e) { /* ignore */ }
    finally { setGalleryLoading(false); }
  }, []);

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
        const res = await fetch(`/api/gallery/${editingGalleryId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.success) {
          showToast('Gallery Item Updated', `"${galleryForm.name}" updated.`, 'success');
        } else throw new Error(data.error);
      } else {
        const res = await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.success) {
          showToast('Gallery Item Created', `"${galleryForm.name}" added.`, 'success');
        } else throw new Error(data.error);
      }
      fetchGallery();
      return true;
    } catch (e: any) { showToast('Failed', e.message, 'error'); }
    return false;
  }, []);

  const handleDeleteGalleryItem = useCallback(async (id: string, name: string) => {
    if (!window.confirm(`Delete gallery item "${name}"? This cannot be undone.`)) return false;
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Gallery Item Deleted', `"${name}" removed.`, 'warning');
        fetchGallery();
        return true;
      } else throw new Error(data.error);
    } catch (e: any) { showToast('Delete Failed', e.message, 'error'); }
    return false;
  }, []);

  return {
    galleryItems,
    galleryLoading,
    fetchGallery,
    handleSaveGalleryItem,
    handleDeleteGalleryItem,
  };
}
