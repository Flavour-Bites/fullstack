import { useState, useMemo } from 'react';
import { CakeGalleryItem } from '@shared/types';
import { useGalleryItems } from './useGalleryItems';

export type FilterType = 'all' | 'birthday' | 'kids' | 'treats' | 'celebration';

// Gallery filtering over the real catalog. The catalog comes from the shared
// useGalleryItems query — there is intentionally no static seed data: on an
// empty or unreachable API the grid renders honestly empty instead of showing
// fabricated items as if they were the shop's own work.
export function useGalleryFilters() {
  const { data: items = [], isLoading, error } = useGalleryItems();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Dynamic derivation of all unique tags from the real catalog
  const allUniqueTags: string[] = useMemo(
    () => Array.from(new Set(items.flatMap((item) => item.tags || []))),
    [items],
  );

  // Combined logic to sync search feed, category selection, and multiple tag switches
  const filteredCakes: CakeGalleryItem[] = useMemo(() => {
    let result = items;

    // A. Filter by Category Tab
    if (activeFilter !== 'all') {
      result = result.filter((item) => {
        const catSlug = typeof item.category === 'string' ? item.category : item.category?.slug;
        return catSlug === activeFilter;
      });
    }

    // B. Filter by search text (ID, Name, Description, Flavor details, or tags)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.flavors.some((f) => f.toLowerCase().includes(query)) ||
          item.tags?.some((t) => t.toLowerCase().includes(query)),
      );
    }

    // C. Filter by Selected Tags cloud (item must contain all selected tag filters)
    if (selectedTags.length > 0) {
      result = result.filter((item) => selectedTags.every((t) => item.tags?.includes(t)));
    }

    return result;
  }, [activeFilter, searchQuery, selectedTags, items]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const clearAllFilters = () => {
    setActiveFilter('all');
    setSearchQuery('');
    setSelectedTags([]);
  };

  const hasActiveFilters = activeFilter !== 'all' || searchQuery !== '' || selectedTags.length > 0;

  return {
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    selectedTags,
    items,
    filteredCakes,
    allUniqueTags,
    isLoading,
    error,
    handleTagToggle,
    clearAllFilters,
    hasActiveFilters,
  };
}