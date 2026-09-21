import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Review } from '@shared/types';
import { t } from '@client/i18n/index';
import InitialsAvatar from '../InitialsAvatar';

interface HomeTestimonialsProps {
  reviews: Review[];
  isLoading?: boolean;
  activeIndex: number;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function HomeTestimonials({ reviews, isLoading = false, activeIndex, onSelect, onPrev, onNext }: HomeTestimonialsProps) {
  const safeIndex =
    reviews.length === 0 ? -1 : Math.min(activeIndex, reviews.length - 1);

  return (
    <section className="relative bg-stone-900 py-24 text-white overflow-hidden">
      {/* Ambient background watermark label */}
      <div className="absolute top-1/2 left-1/2 -track-wide -translate-x-1/2 -translate-y-1/2 opacity-[0.015] font-serif text-[18rem] uppercase select-none pointer-events-none">
        Custom
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center font-sans">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] uppercase tracking-[0.25em] text-lux-gold font-mono block mb-2 font-semibold">{t('home.sweetestCelebrations')}</span>
          <h2 className="text-3xl sm:text-4xl font-serif text-white">Client Reviews & Testimonials</h2>
          <div className="h-[2px] w-12 bg-lux-gold mx-auto mt-4" />
        </div>

        {isLoading ? (
          <div className="min-h-[260px] flex flex-col items-center justify-center gap-3 animate-pulse">
            <div className="h-4 w-32 bg-white/15 rounded" />
            <div className="h-4 w-full max-w-xl bg-white/10 rounded" />
            <div className="h-4 w-3/4 max-w-md bg-white/10 rounded" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="min-h-[260px] flex flex-col items-center justify-center gap-4">
            <p className="text-lg font-serif font-light text-stone-400">
              No client stories published yet.
            </p>
            <p className="text-sm text-stone-500 font-light font-sans">
              Real reviews will appear here once orders are completed and shared.
            </p>
          </div>
        ) : (
          <div className="relative min-h-[290px] sm:min-h-[260px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {reviews.map((review, idx) => {
                if (idx !== safeIndex) return null;
                return (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.01, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-center gap-0.5">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} size={15} className="fill-lux-gold text-lux-gold" />
                      ))}
                    </div>

                    <blockquote className="text-lg sm:text-xl lg:text-2xl font-serif font-light leading-relaxed max-w-3xl mx-auto italic text-stone-100">
                      "{review.content}"
                    </blockquote>

                    <div className="flex items-center justify-center gap-4 pt-4 text-left">
                      <InitialsAvatar name={review.author} className="w-11 h-11 text-xs border-2 border-lux-gold/30" />
                      <div>
                        <cite className="not-italic font-semibold text-sm tracking-wide block text-white font-serif">{review.author}</cite>
                        <span className="text-xs text-stone-400 font-light block font-sans mt-0.5">{review.eventType} — {review.role}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Slider controls: responsive buttons and dots */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={onPrev}
            disabled={reviews.length <= 1}
            className="p-2 border border-white/10 hover:border-lux-gold rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-all cursor-pointer disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:bg-transparent disabled:hover:text-white/50"
            aria-label="Previous review"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-1.5">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => onSelect(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${safeIndex === idx ? 'w-6 bg-lux-gold' : 'w-1.5 bg-white/20'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
          <button
            onClick={onNext}
            disabled={reviews.length <= 1}
            className="p-2 border border-white/10 hover:border-lux-gold rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-all cursor-pointer disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:bg-transparent disabled:hover:text-white/50"
            aria-label="Next review"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/testimonials"
            className="inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-stone-300 hover:text-lux-gold transition-colors group cursor-pointer"
          >
            <span>Read all client tributes & reviews</span>
            <ChevronRight className="w-3.5 h-3.5 text-lux-gold group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}