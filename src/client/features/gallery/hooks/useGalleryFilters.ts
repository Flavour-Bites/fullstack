import { useState, useEffect, useMemo } from 'react';
import { CakeGalleryItem } from '@shared/types';
import { GALLERY_ITEMS } from '@client/data';
import { http } from '@client/lib/http';
import type { ApiResponse } from '@/shared/api';

export type FilterType = 'all' | 'birthday' | 'kids' | 'treats' | 'celebration';

export function useGalleryFilters() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [items, setItems] = useState<CakeGalleryItem[]>(GALLERY_ITEMS);
  const [filteredCakes, setFilteredCakes] = useState<CakeGalleryItem[]>(GALLERY_ITEMS);

  // Load from Postgres backend if reachable, otherwise fall back gracefully
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const { data } = await http.get<ApiResponse<{ items: CakeGalleryItem[] }>>('/api/gallery');
        if (data.success && data.items && data.items.length > 0) {
          setItems(data.items);
          setFilteredCakes(data.items);
        }
      } catch (err) {
        console.warn('Postgres custom cake gallery items unavailable, serving local backup:', err);
      }
    };
    fetchGallery();
  }, []);

  // Dynamic derivation of all unique tags from our catalog
  const allUniqueTags: string[] = useMemo(
    () => Array.from(new Set(items.flatMap((item) => item.tags || []))),
    [items],
  );

  // Combined logic to sync search feed, category selection, and multiple tag switches
  useEffect(() => {
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
      result = result.filter((item) =>
        selectedTags.every((t) => item.tags?.includes(t)),
      );
    }

    setFilteredCakes(result);
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
    handleTagToggle,
    clearAllFilters,
    hasActiveFilters,
  };
}