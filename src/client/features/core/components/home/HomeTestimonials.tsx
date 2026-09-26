import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { t } from '@client/i18n/index';
import type { Review } from '@shared/types';

interface HomeTestimonialsProps {
  reviews: Review[];
  isLoading?: boolean;
  activeIndex: number;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function HomeTestimonials({
  reviews,
  isLoading,
  activeIndex,
  onSelect,
  onPrev,
  onNext,
}: HomeTestimonialsProps) {
  return (
    <section className="relative bg-stone-900 py-24 text-white overflow-hidden">
      {/* Ambient background watermark label */}
      <div className="absolute top-1/2 left-1/2 -track-wide -translate-x-1/2 -translate-y-1/2 opacity-[0.015] font-serif text-[18rem] uppercase select-none pointer-events-none">
        Custom
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center font-sans">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] uppercase tracking-[0.25em] text-lux-gold font-mono block mb-2 font-semibold">
            {t('home.sweetestCelebrations')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-white">Client Reviews & Testimonials</h2>
          <div className="h-[2px] w-12 bg-lux-gold mx-auto mt-4" />
        </div>

        <div className="relative min-h-[290px] sm:min-h-[260px] flex items-center justify-center">
          {isLoading ? (
            <div className="space-y-4 max-w-md mx-auto w-full animate-pulse">
              <div className="flex justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-4 h-4 rounded-full bg-stone-800" />
                ))}
              </div>
              <div className="h-6 bg-stone-800 rounded-sm w-3/4 mx-auto" />
              <div className="h-4 bg-stone-800 rounded-sm w-1/2 mx-auto" />
              <div className="w-10 h-10 rounded-full bg-stone-800 mx-auto mt-4" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-10 text-center space-y-4 max-w-md mx-auto">
              <div className="flex justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className="fill-lux-gold/30 text-lux-gold/30" />
                ))}
              </div>
              <p className="text-xl font-serif font-light italic text-stone-300">
                Be the first customer to leave a review after your cake tasting or celebration.
              </p>
              <div className="pt-2">
                <Link
                  to="/request"
                  className="inline-block text-xs uppercase tracking-widest text-lux-gold border border-lux-gold/40 px-5 py-2.5 rounded-xs hover:bg-lux-gold hover:text-stone-950 transition-colors font-mono font-semibold"
                >
                  Order a Custom Cake
                </Link>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {reviews.map((review, idx) => {
                if (idx !== activeIndex) return null;
                const userPhoto = review.user?.telegramPhoto;
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
                      {userPhoto ? (
                        <img
                          src={userPhoto}
                          alt={review.author}
                          className="w-11 h-11 rounded-full object-cover border-2 border-lux-gold/30 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-lux-gold/20 border-2 border-lux-gold/40 flex items-center justify-center text-lux-gold font-serif font-bold text-sm shrink-0">
                          {review.author ? review.author.charAt(0).toUpperCase() : 'FB'}
                        </div>
                      )}
                      <div>
                        <cite className="not-italic font-semibold text-sm tracking-wide block text-white font-serif">
                          {review.author}
                        </cite>
                        <span className="text-xs text-stone-400 font-light block font-sans mt-0.5">
                          {review.eventType} — {review.role}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Slider controls: only show if more than 1 review exists */}
        {!isLoading && reviews.length > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={onPrev}
              className="p-2 border border-white/10 hover:border-lux-gold rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-all cursor-pointer"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1.5">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelect(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeIndex === idx ? 'w-6 bg-lux-gold' : 'w-1.5 bg-white/20'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={onNext}
              className="p-2 border border-white/10 hover:border-lux-gold rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-all cursor-pointer"
              aria-label="Next review"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

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