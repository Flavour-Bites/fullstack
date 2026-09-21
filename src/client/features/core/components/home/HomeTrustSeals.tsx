import { Star, Heart, Check, Award } from 'lucide-react';
import { t } from '@client/i18n/index';

const SEALS = [
  { icon: Star, value: '500+', labelKey: 'home.statsCakesHandcrafted' },
  { icon: Heart, value: '100%', labelKey: 'home.statsMadeWithLove' },
  { icon: Check, value: 'Fresh', labelKey: 'home.statsPremiumIngredients' },
  { icon: Award, value: '5-Star', labelKey: 'home.statsHappyClients' },
] as const;

export default function HomeTrustSeals() {
  return (
    <section className="bg-stone-50 dark:bg-stone-950 border-y border-stone-200/50 dark:border-stone-850/80 py-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {SEALS.map(({ icon: Icon, value, labelKey }, idx) => (
            <div key={idx} className="flex items-center gap-3.5 pl-2 sm:pl-4">
              <div className="w-10 h-10 rounded-full bg-lux-gold/10 flex items-center justify-center shrink-0 border border-lux-gold/15">
                <Icon className="w-5 h-5 text-lux-gold" />
              </div>
              <div className="text-left font-sans">
                <p className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 leading-none">{value}</p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 font-light mt-1 tracking-wide">{t(labelKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}