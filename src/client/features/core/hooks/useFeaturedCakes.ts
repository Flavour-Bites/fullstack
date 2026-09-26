import { useFeaturedCakesQuery } from '@client/features/gallery/hooks/useGalleryQuery';
import type { Product } from '@shared/types';

export function useFeaturedCakes(): Product[] {
  const { data: featuredCakes = [] } = useFeaturedCakesQuery();

  return featuredCakes;
}