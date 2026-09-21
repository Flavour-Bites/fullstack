import { motion } from 'motion/react';
import { ChevronRight, Info } from 'lucide-react';
import { CakeGalleryItem } from '@shared/types';
import { t } from '@client/i18n/index';
import { cardVariants } from './galleryMotion';

interface GalleryCardProps {
  cake: CakeGalleryItem;
  index: number;
  selectedTags: string[];
  onSelect: (cake: CakeGalleryItem) => void;
  onTagToggle: (tag: string) => void;
}

export default function GalleryCard({ cake, index, selectedTags, onSelect, onTagToggle }: GalleryCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      key={cake.id}
      onClick={() => onSelect(cake)}
      className="break-inside-avoid bg-white dark:bg-stone-950 border border-stone-200/40 dark:border-stone-850 shadow-xs hover:shadow-xl transition-all duration-500 rounded-sm overflow-hidden cursor-pointer group font-sans"
    >
      <div className="relative overflow-hidden bg-stone-100 aspect-auto">
        {/* Unique height matching asymmetric feel */}
        <img
          src={cake.image}
          alt={cake.name}
          style={{
            minHeight: index % 3 === 0 ? '420px' : index % 2 === 0 ? '340px' : '280px',
            maxHeight: '480px',
          }}
          className="w-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6" />

        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1 text-[9px] uppercase tracking-widest font-mono text-stone-800 rounded-sm shadow-xs border border-stone-200/30 font-semibold">
          {cake.category?.name ?? cake.categoryId}
        </div>

        {/* Hover commission prompt */}
        <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-center bg-stone-900/90 text-white backdrop-blur-md py-3 px-4 rounded-sm translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <span className="text-xs tracking-wider uppercase font-light">{t('gallery.viewSecrets')}</span>
          <ChevronRight className="w-4 h-4 text-lux-gold" />
        </div>
      </div>

      <div className="p-5 font-sans text-left">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100 group-hover:text-lux-gold transition-colors block font-medium">
            {cake.name}
          </h3>
          <span className="font-mono text-xs text-lux-gold font-light bg-lux-cream/50 dark:bg-stone-900/60 px-2 py-1 rounded-sm border border-lux-gold/10 whitespace-nowrap">
            {t('gallery.est')}: {cake.priceEstimate}
          </span>
        </div>
        <p className="text-stone-500 dark:text-stone-400 text-xs font-light mt-2 line-clamp-2 leading-relaxed">
          {cake.description}
        </p>

        {/* Card Tags - Interactive click toggling */}
        {cake.tags && cake.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {cake.tags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={(e) => {
                    e.stopPropagation(); // prevent opening details popup
                    onTagToggle(tag);
                  }}
                  className={`px-2 py-0.5 text-[9px] uppercase tracking-wider rounded-sm font-mono transition-all border ${
                    isSelected
                      ? 'bg-lux-gold border-lux-gold text-stone-950 font-semibold'
                      : 'bg-white/80 dark:bg-stone-900/60 border-stone-300 dark:border-stone-750 text-stone-700 dark:text-stone-300 hover:border-lux-gold hover:text-stone-900 dark:hover:text-stone-100 hover:scale-102 cursor-pointer'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-1 text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-widest mt-4">
          <Info className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 animate-pulse" />
          <span>{cake.servingCount}</span>
        </div>
      </div>
    </motion.div>
  );
}