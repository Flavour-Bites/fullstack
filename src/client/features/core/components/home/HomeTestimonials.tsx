import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TESTIMONIALS } from '@client/data';
import { t } from '@client/i18n/index';

interface HomeTestimonialsProps {
  activeIndex: number;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function HomeTestimonials({ activeIndex, onSelect, onPrev, onNext }: HomeTestimonialsProps) {
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

        <div className="relative min-h-[290px] sm:min-h-[260px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {TESTIMONIALS.map((testimonial, idx) => {
              if (idx !== activeIndex) return null;
              return (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.01, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="flex justify-center gap-0.5">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} size={15} className="fill-lux-gold text-lux-gold" />
                    ))}
                  </div>

                  <blockquote className="text-lg sm:text-xl lg:text-2xl font-serif font-light leading-relaxed max-w-3xl mx-auto italic text-stone-100">
                    "{testimonial.content}"
                  </blockquote>

                  <div className="flex items-center justify-center gap-4 pt-4 text-left">
                    <img
                      src={testimonial.image}
                      alt={testimonial.author}
                      className="w-11 h-11 rounded-full object-cover border-2 border-lux-gold/30 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <cite className="not-italic font-semibold text-sm tracking-wide block text-white font-serif">{testimonial.author}</cite>
                      <span className="text-xs text-stone-400 font-light block font-sans mt-0.5">{testimonial.eventType} — {testimonial.role}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Slider controls: responsive buttons and dots */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={onPrev}
            className="p-2 border border-white/10 hover:border-lux-gold rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-all cursor-pointer"
            aria-label="Previous review"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-1.5">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => onSelect(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-6 bg-lux-gold' : 'w-1.5 bg-white/20'}`}
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