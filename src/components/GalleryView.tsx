import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, ChevronRight, Cake, Info, Search, Tag, RotateCcw } from 'lucide-react';
import { CakeGalleryItem } from '../types';
import { GALLERY_ITEMS } from '../data';
import { t } from '../i18n';
import { usePageTitle } from '../hooks/usePageTitle';

interface GalleryViewProps {
  selectedCake: CakeGalleryItem | null;
  onClearSelectedCake: () => void;
  onSelectCake: (cake: CakeGalleryItem | null) => void;
  onCommissionCake: (cake: CakeGalleryItem) => void;
}

type FilterType = 'all' | 'birthday' | 'kids' | 'treats' | 'celebration';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1 as const,
      duration: 0.15
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 110,
      damping: 16
    }
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.12, ease: 'easeInOut' }
  }
};

export default function GalleryView({
  selectedCake,
  onClearSelectedCake,
  onSelectCake,
  onCommissionCake
}: GalleryViewProps) {
  usePageTitle("Gallery");
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [items, setItems] = useState<CakeGalleryItem[]>(GALLERY_ITEMS);
  const [filteredCakes, setFilteredCakes] = useState<CakeGalleryItem[]>(GALLERY_ITEMS);

  // Load from Postgres backend if reachable, otherwise fall back gracefully
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch('/api/gallery');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.items && data.items.length > 0) {
            setItems(data.items);
            setFilteredCakes(data.items);
          }
        }
      } catch (err) {
        console.warn('Postgres custom cake gallery items unavailable, serving local backup:', err);
      }
    };
    fetchGallery();
  }, []);

  // Dynamic derivation of all unique tags from our catalog
  const allUniqueTags: string[] = Array.from(
    new Set(items.flatMap((item) => item.tags || []))
  ) as string[];

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
          item.tags?.some((t) => t.toLowerCase().includes(query))
      );
    }

    // C. Filter by Selected Tags cloud (item must contain all selected tag filters)
    if (selectedTags.length > 0) {
      result = result.filter((item) =>
        selectedTags.every((t) => item.tags?.includes(t))
      );
    }

    setFilteredCakes(result);
  }, [activeFilter, searchQuery, selectedTags, items]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setActiveFilter('all');
    setSearchQuery('');
    setSelectedTags([]);
  };

  const categories: { label: string; value: FilterType }[] = [
    { label: t('gallery.allCollections'), value: 'all' },
    { label: t('gallery.bespokeCelebrations'), value: 'celebration' },
    { label: t('gallery.eliteBirthdays'), value: 'birthday' },
    { label: t('gallery.fairytaleKids'), value: 'kids' },
    { label: t('gallery.gourmetTreats'), value: 'treats' }
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Intro Header */}
      <section className="text-center max-w-2xl mx-auto pt-6 px-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-lux-gold/20 bg-lux-gold/10 mb-4 font-sans font-medium">
          <Sparkles className="w-3.5 h-3.5 text-lux-gold" />
          <span className="text-[10px] uppercase tracking-[0.25em] text-lux-gold font-semibold">{t('gallery.bespokeCatalog')}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif text-warm-950 dark:text-stone-100 mb-7">{t('gallery.customGallery')}</h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 font-light leading-relaxed max-w-lg mx-auto font-sans">
          {t('gallery.galleryDescription')}
        </p>
        <div className="h-[1px] w-24 bg-stone-300 mx-auto mt-6" />
      </section>

      {/* Advanced Filter Control Center Dashboard */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-[#111111] border border-stone-200/60 dark:border-stone-850 p-6 rounded-sm shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Search Input Controls */}
            <div className="relative w-full lg:w-96">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-stone-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder={t('gallery.searchFlavors')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 focus:border-lux-gold focus:outline-none pl-10 pr-10 py-3 text-xs uppercase tracking-wider font-mono rounded-sm transition-all text-stone-800 dark:text-stone-100 placeholder-stone-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-3 flex items-center text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Reset Filters Trigger */}
            <div className="flex items-center gap-3">
              {(activeFilter !== 'all' || searchQuery !== '' || selectedTags.length > 0) && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-dashed border-stone-300 dark:border-stone-800 hover:border-stone-400 text-[10px] uppercase tracking-widest text-stone-500 hover:text-stone-850 dark:hover:text-stone-200 rounded-sm font-mono cursor-pointer transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('gallery.resetFilters')}</span>
                </button>
              )}
            </div>

            {/* Categories Filter Tabs (Horizontal Scrollable for Mobile) */}
            <div className="flex items-center overflow-x-auto gap-2 pb-2 lg:pb-0 scrollbar-none scroll-smooth">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveFilter(cat.value)}
                  className={`px-4 py-2.5 text-[10px] tracking-widest uppercase font-semibold whitespace-nowrap transition-all duration-300 rounded-full cursor-pointer ${
                    activeFilter === cat.value
                      ? 'bg-stone-900 dark:bg-stone-850 border-stone-900 dark:border-stone-800 text-white shadow-xs'
                      : 'bg-white dark:bg-[#111111] border border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:border-stone-400 hover:text-stone-950 dark:hover:text-stone-200 font-sans'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sourcing/Tag Cloud filter ribbon */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-850 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-mono font-semibold text-stone-400 dark:text-stone-500">
              <Tag className="w-3.5 h-3.5" />
              <span>{t('gallery.inspirationTags')}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {allUniqueTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1.5 text-[10px] uppercase font-mono tracking-wider rounded-full transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-lux-gold border-lux-gold text-stone-950 font-semibold shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:border-lux-gold hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Asymmetric Masonry List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        {filteredCakes.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#111111] border border-stone-150 dark:border-stone-850 rounded-sm font-sans">
            <Cake className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4 stroke-1 animate-pulse" />
            <p className="text-lg font-serif italic text-stone-500 dark:text-stone-300">{t('gallery.noDesigns')}</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 font-light">{t('gallery.tryDifferent')}</p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2.5 bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 dark:hover:bg-stone-701 text-white text-xs font-semibold uppercase tracking-widest mt-6 rounded-sm shadow-xs cursor-pointer"
            >
              {t('gallery.clearAllFilters')}
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeFilter}-${selectedTags.join(',')}-${searchQuery}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
            >
              {filteredCakes.map((cake, idx) => (
                <motion.div
                  variants={cardVariants}
                  key={cake.id}
                  onClick={() => onSelectCake(cake)}
                  className="break-inside-avoid bg-white dark:bg-[#111111] border border-stone-200/40 dark:border-stone-850 shadow-xs hover:shadow-xl transition-all duration-500 rounded-sm overflow-hidden cursor-pointer group font-sans"
                >
                  <div className="relative overflow-hidden bg-stone-100 aspect-auto">
                    {/* Unique height matching asymmetric feel */}
                    <img
                      src={cake.image}
                      alt={cake.name}
                      style={{
                        minHeight: idx % 3 === 0 ? '420px' : idx % 2 === 0 ? '340px' : '280px',
                        maxHeight: '480px'
                      }}
                      className="w-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6" />

                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1 text-[9px] uppercase tracking-widest font-mono text-stone-800 rounded-sm shadow-xs border border-stone-200/30 font-semibold animate-pulse">
                      {cake.category}
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
                        Est: {cake.priceEstimate}
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
                                handleTagToggle(tag);
                              }}
                              className={`px-2 py-0.5 text-[9px] uppercase tracking-wider rounded-sm font-mono transition-all border ${
                                isSelected
                                  ? 'bg-lux-gold border-lux-gold text-stone-950 font-semibold'
                                  : 'bg-stone-50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:border-lux-gold hover:text-stone-900 hover:scale-102 cursor-pointer'
                              }`}
                            >
                              #{tag}
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
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </section>

      {/* Lightbox Modal (Detail View) */}
      <AnimatePresence>
        {selectedCake && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 font-sans"
            onClick={onClearSelectedCake}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-[#111111] max-w-4xl w-full rounded-sm overflow-hidden shadow-2xl flex flex-col md:flex-row text-stone-900 border dark:border-stone-850 font-sans relative max-h-[94vh] md:max-h-[85vh] md:h-[620px]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Product Close button - Absolutely positioned z-50 to float cleanly over content or image */}
              <button
                onClick={onClearSelectedCake}
                className="absolute top-4 right-4 z-50 p-2 bg-white/90 hover:bg-white dark:bg-stone-900 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-full transition-all cursor-pointer shadow-md border border-stone-200/50 dark:border-stone-800"
                aria-label={t('gallery.closeDetails')}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Column Image Portion */}
              <div className="relative w-full md:w-1/2 h-[220px] sm:h-[300px] md:h-full bg-stone-100 dark:bg-stone-900 flex-shrink-0">
                <img
                  src={selectedCake.image}
                  alt={selectedCake.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-stone-900/90 text-white text-[10px] tracking-widest uppercase font-mono px-3 py-1 shadow-md font-semibold font-bold rounded-xs">
                  {t('gallery.collection')} {selectedCake.category}
                </div>
              </div>

              {/* Right Column Content Portion */}
              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-lux-cream/30 dark:bg-stone-900/20 font-sans min-h-0 md:h-full">
                <div className="space-y-6">
                  <div className="text-left">
                    <h2 className="text-2xl md:text-3.5xl font-serif text-warm-950 dark:text-stone-100 leading-tight mb-2">
                      {selectedCake.name}
                    </h2>
                    <span className="text-lux-gold font-mono text-xs uppercase tracking-wide bg-lux-gold/10 px-3 py-1 rounded-sm inline-block font-semibold">
                      {t('gallery.priceEstimate')}: {selectedCake.priceEstimate}
                    </span>
                  </div>

                  <hr className="border-stone-250/65 dark:border-stone-800" />

                  <div className="space-y-2 text-left">
                    <h4 className="text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-450 font-bold font-mono">{t('gallery.designConcept')}</h4>
                    <p className="text-stone-600 dark:text-stone-300 text-sm font-light leading-relaxed">
                      {selectedCake.description}
                    </p>
                  </div>

                  {/* Tags cloud within detail popup */}
                  {selectedCake.tags && selectedCake.tags.length > 0 && (
                    <div className="space-y-2 text-left">
                      <h4 className="text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-450 font-bold font-mono">{t('gallery.stylingElements')}</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCake.tags.map((tag) => (
                          <span
                             key={tag}
                             className="px-2.5 py-1 bg-stone-905 dark:bg-stone-900 text-lux-gold border border-stone-800 text-[10px] font-mono rounded-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 text-left">
                    <h4 className="text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-450 font-bold font-mono">{t('gallery.flavorPairings')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCake.flavors.map((flv, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 font-light rounded-sm">
                          {flv}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-white dark:bg-[#111111] p-4 border border-stone-200/50 dark:border-stone-850 rounded-sm shadow-xs text-left">
                    <div>
                      <h5 className="text-[9px] uppercase tracking-widest text-stone-450 dark:text-stone-500 font-bold font-mono">{t('gallery.servingsCapacity')}</h5>
                      <p className="text-xs font-semibold text-stone-850 dark:text-stone-100 mt-0.5">{selectedCake.servingCount}</p>
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
                    onClick={() => {
                      onCommissionCake(selectedCake);
                    }}
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

    </div>
  );
}
