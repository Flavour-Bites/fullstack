import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { t } from '@client/i18n/index';

const STEPS = [
  { num: '01', titleKey: 'home.step1Title', descKey: 'home.step1Desc', active: false },
  { num: '02', titleKey: 'home.step2Title', descKey: 'home.step2Desc', active: true },
  { num: '03', titleKey: 'home.step3Title', descKey: 'home.step3Desc', active: false },
];

export default function HomeProcess() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-xl mx-auto mb-16">
        <span className="text-[10px] uppercase tracking-[0.25em] text-lux-gold font-bold block mb-2 font-mono">{t('home.processSubtitle')}</span>
        <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 dark:text-stone-100">{t('home.processTitle')}</h2>
        <div className="h-[2px] w-12 bg-lux-gold mx-auto mt-4" />
        <p className="text-stone-550 dark:text-stone-400 text-xs font-light mt-3 leading-relaxed max-w-sm mx-auto">
          {t('home.processDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative text-left font-sans">
        {/* Aesthetic link line for desktop */}
        <div className="absolute top-1/4 left-[15%] right-[15%] h-[1px] border-t border-dashed border-lux-gold/30 hidden md:block z-0" />

        {STEPS.map((step) => (
          <div key={step.num} className="relative z-10 text-center space-y-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto text-xl font-serif shadow-md ${
                step.active
                  ? 'bg-lux-gold text-stone-950 shadow-lg'
                  : 'bg-white dark:bg-stone-900 border border-lux-gold text-lux-gold'
              }`}
            >
              {step.num}
            </div>
            <h3 className="text-lg font-serif font-semibold text-stone-900 dark:text-stone-100">{t(step.titleKey)}</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-light leading-relaxed max-w-xs mx-auto">
              {t(step.descKey)}
            </p>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link
          to="/request"
          className="inline-flex items-center gap-2 px-8 py-4 bg-stone-900 dark:bg-stone-150 text-white dark:text-stone-950 font-bold text-[10px] uppercase tracking-[0.2em] rounded-sm transition-all hover:bg-lux-gold hover:text-stone-950 hover:dark:bg-lux-gold hover:dark:text-stone-950 shadow-md cursor-pointer hover:translate-y-[-1.5px]"
        >
          {t('home.startRequest')}
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}