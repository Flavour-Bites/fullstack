import { CakeGalleryItem } from '@shared/types';
import { useGalleryItems } from '../../gallery/hooks/useGalleryItems';

// Home-page featured strip: the three most recent real (or zero items on a
// cold/empty catalog) gallery pieces — never static stand-ins.
export function useFeaturedCakes(): CakeGalleryItem[] {
  const { data: items = [] } = useGalleryItems();
  return items.slice(0, 3);
}