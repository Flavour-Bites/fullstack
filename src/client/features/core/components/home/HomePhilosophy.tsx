import { ShieldCheck } from 'lucide-react';
import { t } from '@client/i18n/index';

export default function HomePhilosophy() {
  return (
    <section className="bg-stone-950 text-white py-24 relative overflow-hidden">
      {/* Soft, glowing radial backdrops */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full border border-white/5 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] rounded-full border border-white/5 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-left font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Sourcing credentials and value block */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-900/80 border border-lux-gold/25 rounded-sm">
              <ShieldCheck className="w-4 h-4 text-lux-gold" />
              <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-lux-gold font-bold">{t('home.standardOfExcellence')}</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-serif tracking-tight text-white leading-[1.12]">
              {t('home.oneBakerTitle')} <span className="italic text-lux-gold block">{t('home.noExceptions')}</span>
            </h2>
            <div className="h-[2px] w-16 bg-lux-gold" />

            <p className="text-stone-300 font-light leading-relaxed text-sm sm:text-base tracking-wide font-sans">
              {t('home.philosophyDesc1')}
            </p>
            <p className="text-stone-300 font-light leading-relaxed text-sm tracking-wide font-sans">
              {t('home.philosophyDesc2')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="flex flex-col sm:flex-row items-start gap-3">
                <span className="text-lux-gold font-serif text-4xl font-light leading-none">100%</span>
                <div>
                  <h4 className="text-sm font-semibold tracking-wide text-white">{t('home.pureHandmade')}</h4>
                  <p className="text-xs text-stone-400 font-light mt-0.5 leading-snug">{t('home.pureHandmadeDesc')}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start gap-3">
                <span className="text-lux-gold font-serif text-4xl font-light leading-none">Local</span>
                <div>
                  <h4 className="text-sm font-semibold tracking-wide text-white">{t('home.highlandOrganic')}</h4>
                  <p className="text-xs text-stone-400 font-light mt-0.5 leading-snug">{t('home.highlandOrganicDesc')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Premium stacked layout for the right column */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-sm overflow-hidden border border-lux-gold/20 shadow-2xl relative">
              <img
                src="https://images.unsplash.com/photo-1558961313-7f24be4c1945?auto=format&fit=crop&q=80&w=1000"
                alt="Yodit Ashenafi meticulously piping buttercream layers"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            {/* Floating Solid Gold Badge "8+ Years of Craft" */}
            <div className="absolute -bottom-6 -left-6 bg-lux-gold text-stone-950 p-5 rounded-xs shadow-2xl max-w-[210px] text-left border border-white/10">
              <p className="font-serif text-3xl font-bold text-stone-950 leading-none">8+ Yrs</p>
              <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-900/80 mt-1">{t('home.dedicatedStudio')}</p>
              <p className="text-[9px] text-stone-850 font-light mt-1.5 font-sans leading-snug">{t('home.dedicatedStudioDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}