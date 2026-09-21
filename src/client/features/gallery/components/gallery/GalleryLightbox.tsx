import { AnimatePresence, motion } from 'motion/react';
import { X, Cake } from 'lucide-react';
import { CakeGalleryItem } from '@shared/types';
import { t } from '@client/i18n/index';

interface GalleryLightboxProps {
  cake: CakeGalleryItem | null;
  onClose: () => void;
  onCommission: (cake: CakeGalleryItem) => void;
}

export default function GalleryLightbox({ cake, onClose, onCommission }: GalleryLightboxProps) {
  return (
    <AnimatePresence>
      {cake && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 font-sans"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-stone-950 max-w-4xl w-full rounded-sm overflow-hidden shadow-2xl flex flex-col md:flex-row text-stone-900 border dark:border-stone-850 font-sans relative max-h-[94vh] md:max-h-[85vh] md:h-[620px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Product Close button - Absolutely positioned z-50 to float cleanly over content or image */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-3 bg-white/90 hover:bg-white dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-full transition-all cursor-pointer shadow-md border border-stone-200/50 dark:border-stone-800"
              aria-label={t('gallery.closeDetails')}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Column Image Portion */}
            <div className="relative w-full md:w-1/2 h-[220px] sm:h-[300px] md:h-full bg-stone-100 dark:bg-stone-900 flex-shrink-0">
              <img
                src={cake.image}
                alt={cake.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-stone-900/90 text-white text-[10px] tracking-widest uppercase font-mono px-3 py-1 shadow-md font-semibold font-bold rounded-xs">
                {t('gallery.collection')} {cake.category?.name ?? cake.categoryId}
              </div>
            </div>

            {/* Right Column Content Portion */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-lux-cream/30 dark:bg-stone-900/20 font-sans min-h-0 md:h-full">
              <div className="space-y-6">
                <div className="text-left">
                  <h2 className="text-2xl md:text-3.5xl font-serif text-warm-950 dark:text-stone-100 leading-tight mb-2">
                    {cake.name}
                  </h2>
                  <span className="text-lux-gold font-mono text-xs uppercase tracking-wide bg-lux-gold/10 px-3 py-1 rounded-sm inline-block font-semibold">
                    {t('gallery.priceEstimate')}: {cake.priceEstimate}
                  </span>
                </div>

                <hr className="border-stone-250/65 dark:border-stone-800" />

                <div className="space-y-2 text-left">
                  <h4 className="text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-450 font-bold font-mono">{t('gallery.designConcept')}</h4>
                  <p className="text-stone-600 dark:text-stone-300 text-sm font-light leading-relaxed">
                    {cake.description}
                  </p>
                </div>

                {/* Tags cloud within detail popup */}
                {cake.tags && cake.tags.length > 0 && (
                  <div className="space-y-2 text-left">
                    <h4 className="text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-450 font-bold font-mono">{t('gallery.stylingElements')}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {cake.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 bg-stone-905 dark:bg-stone-900 text-lux-gold border border-stone-800 text-[10px] font-mono rounded-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3 text-left">
                  <h4 className="text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-450 font-bold font-mono">{t('gallery.flavorPairings')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {cake.flavors.map((flv, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 font-light rounded-sm">
                        {flv}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-white dark:bg-stone-950 p-4 border border-stone-200/50 dark:border-stone-850 rounded-sm shadow-xs text-left">
                  <div>
                    <h5 className="text-[9px] uppercase tracking-widest text-stone-450 dark:text-stone-500 font-bold font-mono">{t('gallery.servingsCapacity')}</h5>
                    <p className="text-xs font-semibold text-stone-850 dark:text-stone-100 mt-0.5">{cake.servingCount}</p>
                  </div>
                  <div>
                    <h5 className="text-[9px] uppercase tracking-widest text-stone-450 dark:text-stone-500 font-bold font-mono">{t('gallery.leadTime')}</h5>
                    <p className="text-xs font-semibold text-stone-850 dark:text-stone-100 mt-0.5">
                      {t('gallery.min48Hours')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-6 md:pt-0">
                <button
                  onClick={() => onCommission(cake)}
                  className="w-full py-4 bg-stone-900 dark:bg-stone-800 text-white font-medium text-xs tracking-[0.2em] uppercase rounded-sm transition-all shadow-md hover:bg-stone-800 dark:hover:bg-stone-700 cursor-pointer flex items-center justify-center gap-2 hover:translate-y-[-1px]"
                >
                  <Cake className="w-4 h-4 text-lux-gold" />
                  {t('gallery.commissionSimilar')}
                </button>
                <p className="text-center text-[10px] text-stone-400">
                  {t('gallery.everyCakeCustomizable')}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}