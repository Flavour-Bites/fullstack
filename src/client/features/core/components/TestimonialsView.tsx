import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Quote } from 'lucide-react';
import { t } from '@client/i18n/index';
import { usePageTitle } from '../hooks/usePageTitle';
import { useTestimonials } from '../hooks/useTestimonials';
import InitialsAvatar from './InitialsAvatar';

export default function TestimonialsView() {
  usePageTitle("Testimonials");
  const { data: reviews = [], isLoading } = useTestimonials();
  const [filter, setFilter] = useState<'all' | 'celebration' | 'birthday'>('all');

  const filteredReviews = reviews.filter((review) => {
    if (filter === 'all') return true;
    if (filter === 'celebration') return review.eventType.toLowerCase().includes('celebration') || review.eventType.toLowerCase().includes('anniversary') || review.eventType.toLowerCase().includes('wedding');
    if (filter === 'birthday') return review.eventType.toLowerCase().includes('birthday') || review.eventType.toLowerCase().includes('party');
    return true;
  });

  return (
    <div className="bg-stone-50 dark:bg-stone-900 min-h-screen font-sans pb-0">
      {/* Subtle Gradient Hero Section */}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-lux-gold/5 dark:from-lux-gold/10 to-transparent -z-10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center"
        >
          <span className="text-xs uppercase tracking-widest text-lux-gold font-semibold block mb-4">
            {t('testimonials.title')}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-stone-900 dark:text-white mb-6 leading-tight">
            Customer Stories
          </h1>
          <p className="text-base md:text-lg text-stone-500 dark:text-stone-400 font-light max-w-xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </motion.div>
      </section>

      {/* Floating Pill Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-16 relative z-10">
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 shadow-sm ${
              filter === 'all'
                ? 'bg-lux-gold text-white shadow-lux-gold/20'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
            }`}
          >
            {t('testimonials.allTributes')}
          </button>
          <button
            onClick={() => setFilter('celebration')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 shadow-sm ${
              filter === 'celebration'
                ? 'bg-lux-gold text-white shadow-lux-gold/20'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
            }`}
          >
            {t('testimonials.milestoneCelebrations')}
          </button>
          <button
            onClick={() => setFilter('birthday')}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 shadow-sm ${
              filter === 'birthday'
                ? 'bg-lux-gold text-white shadow-lux-gold/20'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
            }`}
          >
            {t('testimonials.birthdaysParties')}
          </button>
        </div>
      </section>

      {/* Masonry Waterfall Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-32">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {isLoading && (
            <>
              {[0, 1, 2].map((i) => (
                <div key={i} className="break-inside-avoid bg-white dark:bg-stone-800 p-8 rounded-2xl shadow-xs border border-stone-100 dark:border-stone-700/50 animate-pulse">
                  <div className="h-4 w-24 bg-stone-200 dark:bg-stone-700 rounded mb-6" />
                  <div className="h-3 bg-stone-100 dark:bg-stone-700/60 rounded mb-2" />
                  <div className="h-3 bg-stone-100 dark:bg-stone-700/60 rounded mb-2" />
                  <div className="h-3 w-2/3 bg-stone-100 dark:bg-stone-700/60 rounded mb-8" />
                  <div className="flex items-center gap-4 pt-6 border-t border-stone-100 dark:border-stone-700/50">
                    <div className="w-12 h-12 rounded-full bg-stone-200 dark:bg-stone-700" />
                    <div className="h-3 w-28 bg-stone-100 dark:bg-stone-700/60 rounded" />
                  </div>
                </div>
              ))}
            </>
          )}

          {!isLoading && filteredReviews.length === 0 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 text-center">
              <p className="text-stone-400 dark:text-stone-500 font-serif text-xl">
                No client stories here yet.
              </p>
              <p className="text-sm text-stone-400 dark:text-stone-600 mt-2 font-sans">
                Real reviews appear here after completed orders are published.
              </p>
            </div>
          )}

          <AnimatePresence>
            {filteredReviews.map((review, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, delay: (idx % 3) * 0.1, ease: "easeOut" }}
                key={review.id}
                className="break-inside-avoid bg-white dark:bg-stone-800 p-8 rounded-2xl shadow-xs border border-stone-100 dark:border-stone-700/50 hover:shadow-lg transition-shadow duration-300 relative group"
              >
                <Quote className="absolute top-6 right-6 w-8 h-8 text-lux-gold/20 dark:text-lux-gold/10 group-hover:text-lux-gold/40 transition-colors duration-300" />

                {/* Rating Stars */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <span key={i} className="text-lux-gold text-sm leading-none">★</span>
                  ))}
                </div>

                <p className="text-stone-700 dark:text-stone-200 font-serif text-lg leading-relaxed mb-8">
                  "{review.content}"
                </p>

                <div className="flex items-center gap-4 pt-6 border-t border-stone-100 dark:border-stone-700/50">
                  <InitialsAvatar name={review.author} className="w-12 h-12 text-sm" />
                  <div>
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                      {review.author}
                    </h4>
                    <span className="text-xs text-stone-500 dark:text-stone-400 block mt-0.5">
                      {review.eventType} • {review.role}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Press & Kudos Modern Footer Section */}
      <section className="bg-stone-950 py-24 relative overflow-hidden">
        {/* Abstract shapes for organic feel */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-lux-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-lux-gold/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/3" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif text-white mb-4">Loved by Our Community</h2>
            <div className="h-[2px] w-12 bg-lux-gold mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center md:text-left">
            <div className="space-y-4">
              <span className="text-xl font-serif text-white block">Milestones</span>
              <p className="text-stone-400 text-sm font-light leading-relaxed">
                "Yodit’s attention to child birthday themes is phenomenal. She makes children smile and the vanilla sponge was beautifully soft and moist!"
              </p>
            </div>

            <div className="space-y-4">
              <span className="text-xl font-serif text-white block">Platters</span>
              <p className="text-stone-400 text-sm font-light leading-relaxed">
                "We ordered custom treat platters for our family gathering. The presentation was gorgeous and the pickup slot at her home studio was completely on-time."
              </p>
            </div>

            <div className="space-y-4">
              <span className="text-xl font-serif text-white block">Artistry</span>
              <p className="text-stone-400 text-sm font-light leading-relaxed">
                "The double dark chocolate ganache was rich, structural, and elegant. Yodit represents the best of specialized custom baking in Addis Ababa!"
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Award className="w-5 h-5 text-lux-gold" />
                <span className="text-xl font-serif text-white block">Dietary</span>
              </div>
              <p className="text-stone-400 text-sm font-light leading-relaxed">
                "Having safe, isolated preparation for our eggless custom request was a true blessing. Flavour Bites respects raw palates in a class of its own."
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}