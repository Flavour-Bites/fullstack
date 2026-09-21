import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { t } from '@client/i18n/index';

export default function HomeFinalCta() {
  return (
    <section className="relative py-28 overflow-hidden rounded-xs bg-stone-950">
      <div className="absolute inset-0 select-none opacity-20">
        <img
          src="https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&q=80&w=1200"
          alt="Event decor detail"
          className="w-full h-full object-cover scale-102"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-stone-950/80" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-5 text-center font-sans space-y-6">
        <span className="text-[10px] uppercase tracking-[0.35em] text-lux-gold font-bold font-mono">{t('home.ctaSuperTitle')}</span>

        <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
          {t('home.ctaTitle')} <br />
          <span className="text-lux-gold italic">{t('home.ctaSubtitle')}</span>
        </h2>

        <p className="text-stone-300 font-light text-sm sm:text-base mb-10 max-w-md mx-auto leading-relaxed">
          {t('home.ctaDesc')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Link
            to="/request"
            className="bg-lux-gold text-stone-950 font-semibold px-8 py-4 rounded-sm hover:bg-white hover:text-stone-950 transition-all hover:shadow-[0_8px_32px_rgba(197,168,128,0.25)] flex items-center justify-center gap-2 cursor-pointer font-mono text-xs uppercase tracking-wider"
          >
            {t('home.requestCake')} <ChevronRight className="w-4 h-4" />
          </Link>
          <Link
            to="/contact"
            className="border border-white/20 hover:border-lux-gold text-white px-8 py-4 rounded-sm hover:bg-white/5 transition-all text-xs font-semibold tracking-wider font-mono cursor-pointer uppercase"
          >
            {t('home.getInTouch')}
          </Link>
        </div>
      </div>
    </section>
  );
}