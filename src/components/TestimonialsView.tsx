import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Quote, Award } from 'lucide-react';
import { TESTIMONIALS } from '../data';
import { t } from '../i18n';
import { usePageTitle } from '../hooks/usePageTitle';

export default function TestimonialsView() {
  usePageTitle("Testimonials");
  const [filter, setFilter] = useState<'all' | 'celebration' | 'birthday'>('all');

  const filteredReviews = TESTIMONIALS.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'celebration') return t.eventType.toLowerCase().includes('celebration') || t.eventType.toLowerCase().includes('anniversary');
    if (filter === 'birthday') return t.eventType.toLowerCase().includes('birthday') || t.eventType.toLowerCase().includes('party');
    return true;
  });

  return (
    <div className="space-y-24 pb-16">
      {/* Editorial Header */}
      <section className="text-center max-w-2xl mx-auto pt-6 px-4">
        <h1 className="text-4xl sm:text-5xl font-serif text-warm-950 dark:text-stone-100 mb-3">{t('testimonials.title')}</h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 font-light leading-relaxed max-w-lg mx-auto font-sans">
          {t('testimonials.subtitle')}
        </p>
        <div className="h-[1px] w-24 bg-stone-300 mx-auto mt-6" />
      </section>

      {/* Trust & Review Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 font-sans">
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 text-xs tracking-widest uppercase transition-all duration-300 rounded-full cursor-pointer ${
              filter === 'all'
                ? 'bg-stone-900 dark:bg-stone-800 text-white shadow-md font-semibold'
                : 'bg-white dark:bg-[#111111] border border-stone-200 dark:border-stone-850 text-stone-600 dark:text-stone-450 hover:text-stone-950 dark:hover:text-white'
            }`}
          >
            {t('testimonials.allTributes')}
          </button>
          <button
            onClick={() => setFilter('celebration')}
            className={`px-6 py-2 text-xs tracking-widest uppercase transition-all duration-300 rounded-full cursor-pointer ${
              filter === 'celebration'
                ? 'bg-stone-900 dark:bg-stone-800 text-white shadow-md font-semibold'
                : 'bg-white dark:bg-[#111111] border border-stone-200 dark:border-stone-850 text-stone-600 dark:text-stone-450 hover:text-stone-950 dark:hover:text-white'
            }`}
          >
            {t('testimonials.milestoneCelebrations')}
          </button>
          <button
            onClick={() => setFilter('birthday')}
            className={`px-6 py-2 text-xs tracking-widest uppercase transition-all duration-300 rounded-full cursor-pointer ${
              filter === 'birthday'
                ? 'bg-stone-900 dark:bg-stone-800 text-white shadow-md font-semibold'
                : 'bg-white dark:bg-[#111111] border border-stone-200 dark:border-stone-850 text-stone-600 dark:text-stone-450 hover:text-stone-950 dark:hover:text-white'
            }`}
          >
            {t('testimonials.birthdaysParties')}
          </button>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch font-sans">
          {filteredReviews.map((t, idx) => {
            // Asymmetric grid spans for a bento feel
            const mdSpan = idx === 0 ? 'md:col-span-8' : idx === 1 ? 'md:col-span-4' : idx === 2 ? 'md:col-span-5' : 'md:col-span-7';
            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                key={t.id}
                className={`${mdSpan} bg-white dark:bg-[#111111] p-8 border border-stone-200/60 dark:border-stone-850 rounded-sm shadow-xs flex flex-col justify-between relative overflow-hidden group hover:shadow-lg hover:border-lux-gold/30 transition-all duration-400`}
              >
                {/* Vintage Watermark Quote Icon */}
                <Quote className="absolute right-6 top-6 w-16 h-16 text-stone-150 dark:text-stone-800 opacity-[0.4] dark:opacity-[0.1] select-none pointer-events-none group-hover:scale-110 transition-transform duration-500" />

                <div className="space-y-6">
                  {/* Rating Stars */}
                  <div className="flex gap-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <span key={i} className="text-lux-gold text-lg leading-none">★</span>
                    ))}
                  </div>

                  <p className="text-stone-700 dark:text-stone-200 font-serif italic text-base leading-relaxed relative z-10">
                    "{t.content}"
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-8 border-t border-stone-100 dark:border-stone-850 mt-6 relative z-10">
                  <img
                    src={t.image}
                    alt={t.author}
                    className="w-12 h-12 rounded-full object-cover border border-stone-200 dark:border-stone-800"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm tracking-wide">{t.author}</h4>
                    <span className="text-xs text-stone-500 dark:text-stone-400 font-light block mt-0.5">{t.eventType} — {t.role}</span>
                  </div>
                  <span className="ml-auto text-[10px] text-stone-400 dark:text-stone-500 font-mono self-end hidden sm:block">{t.date}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Press & Kudos Column */}
      <section className="bg-stone-950 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-stone-950 opacity-80" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[10px] uppercase tracking-[0.3em] text-lux-gold font-mono block mb-2 font-semibold">{t('testimonials.communityFeedback')}</span>
            <h2 className="text-3xl sm:text-4xl font-serif text-white">{t('testimonials.lovedByHosts')}</h2>
            <div className="h-[2px] w-12 bg-lux-gold mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left items-start font-sans">
            {/* Spotlight 1 */}
            <div className="space-y-4">
              <span className="font-serif italic font-extrabold text-[1.8rem] tracking-wider text-white block select-none mb-2">Milestones</span>
              <div className="h-[1px] w-12 bg-lux-gold md:mx-0 mx-auto" />
              <blockquote className="text-stone-300 text-xs font-light leading-relaxed italic">
                "Yodit’s attention to child birthday themes is phenomenal. She makes children smile and the vanilla sponge was beautifully soft and moist!"
              </blockquote>
            </div>

            {/* Spotlight 2 */}
            <div className="space-y-4">
              <span className="font-serif italic font-medium text-[1.8rem] tracking-wider text-white block select-none uppercase mb-2">Platters</span>
              <div className="h-[1px] w-12 bg-lux-gold md:mx-0 mx-auto" />
              <blockquote className="text-stone-300 text-xs font-light leading-relaxed italic">
                "We ordered custom treat platters for our family gathering. The presentation was gorgeous and the pickup slot at her home studio was completely on-time."
              </blockquote>
            </div>

            {/* Spotlight 3 */}
            <div className="space-y-4">
              <span className="font-serif font-light text-[1.8rem] tracking-wider text-white block select-none uppercase mb-2">Artistry</span>
              <div className="h-[1px] w-12 bg-lux-gold md:mx-0 mx-auto" />
              <blockquote className="text-stone-300 text-xs font-light leading-relaxed italic">
                "The double dark chocolate ganache was rich, structural, and elegant. Yodit represents the best of specialized custom baking in Addis Ababa!"
              </blockquote>
            </div>

            {/* Spotlight 4 */}
            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-1 font-mono uppercase tracking-widest text-[#faf7f2]/90 font-bold text-lg mb-2">
                <Award className="w-5 h-5 text-lux-gold" />
                <span>DIETARY CARE</span>
              </div>
              <div className="h-[1px] w-12 bg-lux-gold md:mx-0 mx-auto" />
              <blockquote className="text-stone-300 text-xs font-light leading-relaxed italic">
                "Having safe, isolated preparation for our eggless custom request was a true blessing. Flavour Bites respects raw palates in a class of its own."
              </blockquote>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
