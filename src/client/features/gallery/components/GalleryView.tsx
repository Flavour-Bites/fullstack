import { Product } from '@shared/types';
import { t } from '@client/i18n/index';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { useGalleryFilters, FilterType } from '../hooks/useGalleryFilters';
import GalleryIntro from './gallery/GalleryIntro';
import GalleryFilterBar from './gallery/GalleryFilterBar';
import GalleryGrid from './gallery/GalleryGrid';
import GalleryLightbox from './gallery/GalleryLightbox';

interface GalleryViewProps {
  selectedCake: Product | null;
  onClearSelectedCake: () => void;
  onSelectCake: (cake: Product | null) => void;
  onCommissionCake: (cake: Product) => void;
}

export default function GalleryView({
  selectedCake,
  onClearSelectedCake,
  onSelectCake,
  onCommissionCake,
}: GalleryViewProps) {
  usePageTitle("Gallery");
  const gallery = useGalleryFilters();

  const categories: { label: string; value: FilterType }[] = [
    { label: t('gallery.allCollections'), value: 'all' },
    { label: t('gallery.customCelebrations'), value: 'celebration' },
    { label: t('gallery.birthdays'), value: 'birthday' },
    { label: t('gallery.kidsCakes'), value: 'kids' },
    { label: t('gallery.sweetTreats'), value: 'treats' },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Intro Header with generous top breathing room */}
      <GalleryIntro />

      {/* Advanced Filter Floating Controls */}
      <GalleryFilterBar
        categories={categories}
        activeFilter={gallery.activeFilter}
        onFilterChange={gallery.setActiveFilter}
        searchQuery={gallery.searchQuery}
        onSearchChange={gallery.setSearchQuery}
        selectedTags={gallery.selectedTags}
        allUniqueTags={gallery.allUniqueTags}
        onTagToggle={gallery.handleTagToggle}
        onClearAllFilters={gallery.clearAllFilters}
        hasActiveFilters={gallery.hasActiveFilters}
      />

      {/* Asymmetric Masonry List */}
      <GalleryGrid
        filteredCakes={gallery.filteredCakes}
        selectedTags={gallery.selectedTags}
        gridKey={`${gallery.activeFilter}-${gallery.selectedTags.join(',')}-${gallery.searchQuery}`}
        isLoading={gallery.isLoading}
        onSelect={onSelectCake}
        onTagToggle={gallery.handleTagToggle}
        onClearAllFilters={gallery.clearAllFilters}
      />

      {/* Lightbox Modal (Detail View) */}
      <GalleryLightbox
        cake={selectedCake}
        onClose={onClearSelectedCake}
        onCommission={onCommissionCake}
      />
    </div>
  );
}