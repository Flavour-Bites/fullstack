import { useQuery } from '@tanstack/react-query';
import { http } from '@client/lib/http';
import { queryKeys } from '@client/lib/queryKeys';
import type { ApiResponse } from '@/shared/api';
import type { Product } from '@shared/types';

function fetchProducts(): Promise<Product[]> {
  return http.get<ApiResponse<{ items: Product[] }>>('/api/products')
    .then(({ data }) => {
      if (data.success) return data.items ?? [];
      throw new Error(data.error);
    });
}

export function useGalleryQuery() {
  return useQuery({
    queryKey: queryKeys.gallery.all,
    queryFn: fetchProducts,
  });
}

export function useFeaturedProductsQuery() {
  return useQuery({
    queryKey: queryKeys.gallery.all,
    queryFn: fetchProducts,
    select: (items) => items.slice(0, 3),
  });
}

export const useFeaturedCakesQuery = useFeaturedProductsQuery;