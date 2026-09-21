import { AnimatePresence, motion } from 'motion/react';
import { Cake } from 'lucide-react';
import { CakeGalleryItem } from '@shared/types';
import { t } from '@client/i18n/index';
import { containerVariants } from './galleryMotion';
import GalleryCard from './GalleryCard';

interface GalleryGridProps {
  filteredCakes: CakeGalleryItem[];
  selectedTags: string[];
  gridKey: string;
  onSelect: (cake: CakeGalleryItem) => void;
  onTagToggle: (tag: string) => void;
  onClearAllFilters: () => void;
}

export default function GalleryGrid({
  filteredCakes,
  selectedTags,
  gridKey,
  onSelect,
  onTagToggle,
  onClearAllFilters,
}: GalleryGridProps) {
  if (filteredCakes.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center py-20 bg-white dark:bg-stone-950 border border-stone-150 dark:border-stone-850 rounded-sm font-sans">
          <Cake className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4 stroke-1 animate-pulse" />
          <p className="text-lg font-serif italic text-stone-500 dark:text-stone-300">{t('gallery.noDesigns')}</p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 font-light">{t('gallery.tryDifferent')}</p>
          <button
            onClick={onClearAllFilters}
            className="px-6 py-2.5 bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 dark:hover:bg-stone-701 text-white text-xs font-semibold uppercase tracking-widest mt-6 rounded-sm shadow-xs cursor-pointer"
          >
            {t('gallery.clearAllFilters')}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={gridKey}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
        >
          {filteredCakes.map((cake, idx) => (
            <GalleryCard
              key={cake.id}
              cake={cake}
              index={idx}
              selectedTags={selectedTags}
              onSelect={onSelect}
              onTagToggle={onTagToggle}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}