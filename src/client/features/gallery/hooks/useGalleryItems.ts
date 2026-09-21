import { useQuery } from '@tanstack/react-query';
import type { CakeGalleryItem } from '@shared/types';
import { apiGet } from '@client/lib/http';

// Single source of truth for the public gallery catalog. React Query caches
// and dedupes so the gallery page, home "featured" strip, and search modal
// never issue competing fetches or re-request while the data is fresh.
export function useGalleryItems() {
  return useQuery({
    queryKey: ['gallery', 'items'],
    queryFn: async () => (await apiGet<{ items: CakeGalleryItem[] }>('/api/gallery')).items,
  });
}