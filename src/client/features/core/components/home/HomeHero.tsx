import { motion } from 'motion/react';
import { Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { t } from '@client/i18n/index';

const STATS = [
  { value: '500+', labelKey: 'home.statsCakes' },
  { value: '5.0★', labelKey: 'home.statsRating' },
  { value: '8+ Yrs', labelKey: 'home.statsHeritage' },
] as const;

export default function HomeHero() {
  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden bg-stone-950 text-white pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Deep, premium background texture with high contrast overlay */}
      <div className="absolute inset-0 z-0 select-none">
        <img
          src="/hero_cake.png"
          alt="Main visual backdrop"
          className="w-full h-full object-cover opacity-[0.55] scale-105"
          loading="eager"
          referrerPolicy="no-referrer"
        />
        {/* Subtle gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-transparent to-stone-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/50" />
        <div className="absolute -top-1/4 -right-1/4 w-96 h-96 rounded-full bg-lux-gold/10 blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center text-center">
        {/* Text Column */}
        <div className="w-full space-y-7 flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-serif tracking-tight leading-[1.05] text-white max-w-4xl"
          >
            {t('home.heroTitle')} <br />
            <span className="italic font-light text-lux-gold block mt-2">{t('home.heroSubtitle')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-stone-200 text-sm sm:text-lg font-light leading-relaxed max-w-2xl font-sans"
          >
            {t('home.heroDescription')}
          </motion.p>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              to="/request"
              className="w-full sm:w-auto px-10 py-4 bg-lux-gold text-stone-950 font-semibold tracking-widest text-xs uppercase duration-300 transition-all shadow-[0_8px_30px_rgba(197,168,128,0.2)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.3)] hover:bg-white hover:text-stone-950 cursor-pointer flex items-center justify-center gap-2 rounded-sm"
              id="hero-request-btn"
            >
              <Calendar className="w-4 h-4" />
              {t('nav.bookCake')}
            </Link>
            <Link
              to="/gallery"
              className="w-full sm:w-auto px-10 py-4 border border-white/30 hover:border-lux-gold bg-stone-950/40 backdrop-blur-sm hover:bg-stone-900/80 text-white font-medium tracking-widest text-xs transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 rounded-sm uppercase"
              id="hero-gallery-btn"
            >
              {t('home.viewGallery')}
              <ChevronRight className="w-4 h-4 text-lux-gold" />
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center gap-8 sm:gap-16 mt-16 pt-8 border-t border-white/10 text-center"
          >
            {STATS.map((s) => (
              <div key={s.labelKey} className="space-y-1.5">
                <p className="font-serif text-3xl sm:text-4xl font-medium text-white drop-shadow-md">{s.value}</p>
                <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-lux-gold font-semibold">{t(s.labelKey)}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}