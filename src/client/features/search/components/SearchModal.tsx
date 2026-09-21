import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, HelpCircle, ArrowRight, Command, ChevronDown, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FAQS } from '@client/data';
import type { CakeGalleryItem } from '@shared/types';
import { useGalleryItems } from '../../gallery/hooks/useGalleryItems';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCake?: (cake: CakeGalleryItem) => void;
}

export default function SearchModal({ isOpen, onClose, onSelectCake }: SearchModalProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: galleryItems = [], isLoading: galleryLoading } = useGalleryItems();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setExpandedFaqId(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return { cakes: [], faqs: [] };
    const q = query.toLowerCase();

    const cakes = galleryItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.flavors.some((f) => f.toLowerCase().includes(q)) ||
        item.tags?.some((t) => t.toLowerCase().includes(q))
    ).slice(0, 5);

    const faqs = FAQS.filter(
      (faq) =>
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q)
    ).slice(0, 4);

    return { cakes, faqs };
  }, [query, galleryItems]);

  const hasResults = results.cakes.length > 0 || results.faqs.length > 0;
  const hasQuery = query.trim().length > 0;
  const searching = hasQuery && galleryLoading && galleryItems.length === 0 && results.faqs.length === 0;

  const handleCakeClick = (cake: CakeGalleryItem) => {
    if (onSelectCake) {
      onSelectCake(cake);
    }
    onClose();
    navigate('/gallery');
  };

  const toggleFaq = (faqId: string) => {
    setExpandedFaqId((prev) => (prev === faqId ? null : faqId));
  };

  const handleGoToHelp = () => {
    onClose();
    navigate('/help');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9999] bg-stone-950/60 backdrop-blur-sm flex items-start justify-center pt-[12vh] px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-sm shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-100 dark:border-stone-800">
              <Search className="w-5 h-5 text-stone-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cakes, FAQs, flavors..."
                className="flex-1 bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none font-sans"
              />
              <div className="hidden sm:flex items-center gap-1 text-[9px] text-stone-400 font-mono border border-stone-200 dark:border-stone-700 rounded px-1.5 py-0.5">
                ESC
              </div>
              <button
                onClick={onClose}
                className="sm:hidden p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[55vh] overflow-y-auto">
              {!hasQuery && (
                <div className="px-5 py-8 text-center">
                  <Command className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
                  <p className="text-xs text-stone-400 dark:text-stone-500 font-sans">
                    Type to search cakes, flavors, and frequently asked questions.
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-stone-400 font-mono">
                    <span className="flex items-center gap-1">
                      <span className="border border-stone-200 dark:border-stone-700 rounded px-1.5 py-0.5 text-[9px]">⌘K</span>
                      to toggle
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="border border-stone-200 dark:border-stone-700 rounded px-1.5 py-0.5 text-[9px]">ESC</span>
                      to close
                    </span>
                  </div>
                </div>
              )}

              {hasQuery && !hasResults && searching && (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-stone-500 dark:text-stone-400 font-sans">Searching the catalog…</p>
                </div>
              )}

              {hasQuery && !hasResults && !searching && (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-stone-500 dark:text-stone-400 font-sans">No results for "{query}"</p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 font-sans">Try a different search term.</p>
                </div>
              )}

              {results.cakes.length > 0 && (
                <div className="px-3 py-2">
                  <p className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-mono font-semibold px-2 mb-1">Cakes</p>
                  {results.cakes.map((cake) => (
                    <button
                      key={cake.id}
                      onClick={() => handleCakeClick(cake)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors text-left cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-sm bg-stone-100 dark:bg-stone-800 overflow-hidden shrink-0">
                        <img src={cake.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-serif text-stone-900 dark:text-stone-100 truncate group-hover:text-lux-gold transition-colors">{cake.name}</p>
                        <p className="text-[10px] text-stone-400 dark:text-stone-500 truncate font-sans">
                          {cake.category?.name} · {cake.priceEstimate}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600 group-hover:text-lux-gold group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {results.faqs.length > 0 && (
                <div className="px-3 py-2 border-t border-stone-100 dark:border-stone-800">
                  <div className="flex items-center justify-between px-2 mb-1">
                    <p className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-mono font-semibold">FAQs</p>
                    <button
                      onClick={handleGoToHelp}
                      className="text-[10px] font-mono text-lux-gold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Help Center <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  {results.faqs.map((faq) => {
                    const isExpanded = expandedFaqId === faq.id;
                    return (
                      <div key={faq.id} className="rounded-sm overflow-hidden mb-1">
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors text-left cursor-pointer group"
                        >
                          <HelpCircle className="w-4 h-4 text-lux-gold shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-stone-900 dark:text-stone-100 font-sans">{faq.question}</p>
                            <p className="text-[10px] text-stone-400 dark:text-stone-500 font-sans">{faq.category}</p>
                          </div>
                          <ChevronDown className={`w-3.5 h-3.5 text-stone-300 dark:text-stone-600 group-hover:text-lux-gold transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-180 text-lux-gold' : ''}`} />
                        </button>
                        {isExpanded && (
                          <div className="px-4 py-3 ml-7 mr-2 mb-2 bg-stone-50 dark:bg-stone-900/40 border-l-2 border-lux-gold rounded-r-sm text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-sans">
                            <p>{faq.answer}</p>
                            <div className="mt-2.5 pt-2 border-t border-stone-200/50 dark:border-stone-800 flex justify-end">
                              <button
                                onClick={handleGoToHelp}
                                className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-mono text-lux-gold hover:text-lux-gold/80 font-semibold cursor-pointer"
                              >
                                View full Help Guide <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

