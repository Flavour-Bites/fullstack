import { AnimatePresence, motion } from 'motion/react';
import { Cake } from 'lucide-react';
import { Product } from '@shared/types';
import { t } from '@client/i18n/index';
import { SkeletonGrid } from '@client/components/Skeleton';
import { containerVariants } from './galleryMotion';
import GalleryCard from './GalleryCard';

interface GalleryGridProps {
  filteredCakes: Product[];
  selectedTags: string[];
  gridKey: string;
  isLoading?: boolean;
  onSelect: (cake: Product) => void;
  onTagToggle: (tag: string) => void;
  onClearAllFilters: () => void;
}

export default function GalleryGrid({
  filteredCakes,
  selectedTags,
  gridKey,
  isLoading,
  onSelect,
  onTagToggle,
  onClearAllFilters,
}: Readonly<GalleryGridProps>) {
  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <SkeletonGrid items={6} />
      </section>
    );
  }

  if (filteredCakes.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-2xl mx-auto py-16 px-6 text-center border-2 border-dashed border-stone-200/90 dark:border-stone-800/90 rounded-3xl bg-stone-50/50 dark:bg-stone-900/30 font-sans">
          <div className="w-16 h-16 rounded-full bg-lux-gold/10 border border-lux-gold/25 flex items-center justify-center mx-auto mb-4 text-lux-gold shadow-inner">
            <Cake className="w-7 h-7 stroke-[1.5]" />
          </div>
          <h3 className="text-2xl font-serif text-stone-800 dark:text-stone-100 mb-2">
            {t('gallery.noDesigns')}
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 font-light max-w-md mx-auto leading-relaxed mb-6">
            {t('gallery.tryDifferent')}
          </p>
          <button
            onClick={onClearAllFilters}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-lux-gold hover:bg-lux-gold-light text-stone-950 text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer font-mono"
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