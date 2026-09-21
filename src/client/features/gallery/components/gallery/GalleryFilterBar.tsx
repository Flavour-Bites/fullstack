import { X, Search, Tag, RotateCcw } from 'lucide-react';
import { t } from '@client/i18n/index';
import { FilterType } from '../../hooks/useGalleryFilters';

export interface GalleryFilterBarProps {
  categories: { label: string; value: FilterType }[];
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTags: string[];
  allUniqueTags: string[];
  onTagToggle: (tag: string) => void;
  onClearAllFilters: () => void;
  hasActiveFilters: boolean;
}

export default function GalleryFilterBar({
  categories,
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  selectedTags,
  allUniqueTags,
  onTagToggle,
  onClearAllFilters,
  hasActiveFilters,
}: GalleryFilterBarProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input Controls */}
          <div className="relative w-full sm:w-80 lg:w-96 shrink-0">
            <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-stone-500 dark:text-stone-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder={t('gallery.searchFlavors')}
              aria-label={t('gallery.searchFlavors')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus:border-lux-gold focus:ring-1 focus:ring-lux-gold/30 focus:outline-none pl-10 pr-10 py-2.5 text-xs uppercase tracking-wider font-mono rounded-full transition-all text-stone-900 dark:text-stone-100 placeholder-stone-600 dark:placeholder-stone-400 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute inset-y-0 right-3.5 flex items-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Categories and Clear Filters Row */}
          <div className="flex items-center justify-between lg:justify-end gap-3 flex-1 overflow-x-auto scrollbar-none py-1">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              {categories.map((cat) => {
                const isActive = activeFilter === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => onFilterChange(cat.value)}
                    className={`px-4 py-2 text-[10px] tracking-widest uppercase font-semibold whitespace-nowrap transition-all duration-200 rounded-full cursor-pointer border ${
                      isActive
                        ? 'bg-stone-900 dark:bg-stone-100 border-stone-900 dark:border-stone-100 text-white dark:text-stone-950 shadow-xs'
                        : 'bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-750 dark:text-stone-200 hover:border-stone-900 dark:hover:border-stone-300 hover:text-stone-950 dark:hover:text-white font-sans'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Subtle text link "Clear filters" positioned cleanly to the far right */}
            {hasActiveFilters && (
              <button
                onClick={onClearAllFilters}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-lux-gold hover:text-stone-900 dark:hover:text-stone-100 underline decoration-lux-gold/50 underline-offset-4 cursor-pointer transition-colors whitespace-nowrap shrink-0 pl-2"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t('gallery.resetFilters')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Sourcing/Tag Cloud filter row (Floating directly on background) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-mono font-bold text-stone-600 dark:text-stone-400 mr-1">
              <Tag className="w-3.5 h-3.5 text-lux-gold" />
              <span>TAGS:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {allUniqueTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => onTagToggle(tag)}
                    className={`px-3 py-1 text-[10px] uppercase font-mono tracking-wider rounded-full transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-lux-gold border-lux-gold text-stone-950 font-bold shadow-xs'
                        : 'bg-white/90 dark:bg-stone-900/80 border-stone-300 dark:border-stone-700 text-stone-750 dark:text-stone-300 hover:border-lux-gold hover:text-stone-950 dark:hover:text-stone-100'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}