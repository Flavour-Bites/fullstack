import { useState, useEffect } from 'react';
import { CakeGalleryItem } from '@shared/types';
import { GALLERY_ITEMS } from '@client/data';
import { http } from '@client/lib/http';
import type { ApiResponse } from '@/shared/api';

export function useFeaturedCakes() {
  const [featuredCakes, setFeaturedCakes] = useState<CakeGalleryItem[]>(GALLERY_ITEMS.slice(0, 3));

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await http.get<ApiResponse<{ items: CakeGalleryItem[] }>>('/api/gallery');
        if (data.success && data.items && data.items.length > 0) {
          setFeaturedCakes(data.items.slice(0, 3));
        }
      } catch (err) {
        console.warn('Postgres featured query offline, using local backup:', err);
      }
    };
    fetchFeatured();
  }, []);

  return featuredCakes;
}