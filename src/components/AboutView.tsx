import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Utensils, Compass, ChevronRight } from 'lucide-react';
import { IngredientSpotlight } from '../types';
import { INGREDIENT_SPOTLIGHTS } from '../data';
import { t } from '../i18n';
import { usePageTitle } from '../hooks/usePageTitle';

export default function AboutView() {
  usePageTitle("About");
  const [activeSpotlight, setActiveSpotlight] = useState<IngredientSpotlight>(INGREDIENT_SPOTLIGHTS[0]);

  return (
    <div className="space-y-24 pb-16">
      {/* Introduction Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Biography Column */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl font-serif text-warm-950 dark:text-stone-100 leading-tight">
              Yodit Ashenafi
            </h1>
            <p className="italic font-light text-lux-gold font-sans text-xl tracking-normal">{t('about.bakingWithLove')}</p>
          </div>

          <div className="h-[2px] w-20 bg-lux-gold" />

          <div className="space-y-4 text-stone-600 dark:text-stone-300 font-light leading-relaxed text-sm tracking-wide font-sans">
            <p className="text-base text-stone-900 dark:text-stone-150 font-medium font-serif italic">
              "We do not just make cake, we make memories. A beautiful cake should be as wonderful to look at as it is delicious to eat."
            </p>
            <p>
              Growing up, Yodit learned early from her family that great baking requires pure ingredients, patience, and a deep respect for natural flavors. What began as baking beautiful treats for friends and family quickly blossomed into a dedicated custom cake studio.
            </p>
            <p>
              Today, Yodit operates **Flavour Bites** as a boutique home-based bakery in Addis Ababa. She accepts only a very limited number of custom orders each week. This allows her to focus entirely on each design—from sketching ideas to hand-applying the final delicate gold details.
            </p>
          </div>

          {/* Key highlights block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white dark:bg-[#111111] p-5 border border-stone-200/50 dark:border-stone-850 rounded-sm font-sans">
            <div className="flex gap-3">
              <Compass className="w-5 h-5 text-lux-gold mt-1 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-100">{t('about.authenticRecipes')}</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-light mt-0.5">Focusing on traditional slow-baked sponge cakes and rich buttercream textures.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Utensils className="w-5 h-5 text-lux-gold mt-1 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-stone-800 dark:text-stone-100">{t('about.customDecorations')}</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-light mt-0.5">Specially styled by hand using organic elements and edible gold leafing.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Image Column */}
        <div className="lg:col-span-5 relative group">
          <div className="absolute inset-0 border border-lux-gold translate-x-4 translate-y-4 z-0 rounded-xs" />
          <div className="relative z-10 aspect-[3/4] h-[320px] sm:h-[450px] lg:h-[550px] overflow-hidden rounded-xs shadow-xl min-w-full">
            <img
              src="https://images.unsplash.com/photo-1581299894007-aaa50297cf16?auto=format&fit=crop&q=80&w=800"
              alt="Yodit Ashenafi in Studio"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-6 left-6 right-6 bg-stone-900/90 text-white backdrop-blur-md p-5 border-l-2 border-lux-gold rounded-sm font-sans">
              <p className="text-xs tracking-widest uppercase font-mono text-lux-gold mb-1 font-semibold">{t('about.ownerHeadBaker')}</p>
              <p className="font-serif italic text-sm">"Every detail matters because every milestones does."</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Sourcing Spotlight */}
      <section className="bg-stone-900 text-white py-24 relative overflow-hidden">
        {/* Subtle circles */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full border border-white/5 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[10px] uppercase tracking-[0.3em] text-lux-gold font-mono block mb-2 font-semibold">{t('about.ingredients')}</span>
            <h2 className="text-3xl sm:text-4xl font-serif text-white">{t('about.ingredients')}</h2>
            <div className="h-[2px] w-12 bg-lux-gold mx-auto mt-4" />
            <p className="text-stone-400 text-xs font-light mt-3 font-sans">
              We choose only the finest quality flours, butter, and vanilla. Click an ingredient to read about its sourcing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Ingredients Selection Sidebar */}
            <div className="lg:col-span-4 space-y-3 font-sans">
              <h4 className="text-[10px] uppercase tracking-widest text-stone-400 font-mono font-semibold mb-6">{t('about.keyIngredients')}</h4>
              {INGREDIENT_SPOTLIGHTS.map((ing) => (
                <button
                  key={ing.name}
                  onClick={() => setActiveSpotlight(ing)}
                  className={`w-full text-left p-4 rounded-sm border transition-all duration-300 cursor-pointer flex items-center justify-between ${
                    activeSpotlight.name === ing.name
                      ? 'bg-stone-850 border-lux-gold text-white shadow-lg'
                      : 'bg-stone-900/50 border-stone-800 text-stone-400 hover:text-stone-250 hover:bg-stone-850/50'
                  }`}
                >
                  <span className="font-serif text-lg">{ing.name}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${activeSpotlight.name === ing.name ? 'text-lux-gold translate-x-1' : 'text-stone-600'}`} />
                </button>
              ))}
            </div>

            {/* Showcase Detail Frame */}
            <div className="lg:col-span-8 bg-stone-850 border border-stone-800 p-8 sm:p-12 rounded-sm relative shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSpotlight.name}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                >
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-lux-gold font-mono block mb-1 font-semibold">{t('about.whereItComesFrom')}</span>
                      <h3 className="text-3xl font-serif text-white">{activeSpotlight.name}</h3>
                      <p className="text-lux-gold/90 font-mono text-xs italic mt-1 font-semibold">{activeSpotlight.origin}</p>
                    </div>

                    <div className="h-[1px] w-12 bg-lux-gold" />

                    <p className="text-stone-300 text-sm font-light leading-relaxed font-sans">
                      {activeSpotlight.description}
                    </p>

                    <div className="flex items-center gap-2 bg-stone-900/80 p-3 border border-stone-850 rounded-sm text-xs text-stone-400 font-light font-sans">
                      <Award className="w-5 h-5 text-lux-gold shrink-0" />
                      <span>{t('about.highestQuality')}</span>
                    </div>
                  </div>

                  <div className="aspect-square rounded-sm overflow-hidden border border-lux-gold/20 shadow-lg">
                    <img
                      src={activeSpotlight.image}
                      alt={activeSpotlight.name}
                      className="w-full h-full object-cover transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy of limits and studio values */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
        <h2 className="text-[11px] uppercase tracking-[0.3em] text-lux-gold font-light">{t('about.studioEthos')}</h2>
        <p className="text-3xl font-serif text-warm-950 dark:text-stone-100 max-w-2xl mx-auto italic leading-snug">
          "A custom cake represents the sweetness of your celebration. It should never be an afterthought, and it should never taste manufactured."
        </p>
        <div className="h-[2px] w-12 bg-lux-gold mx-auto" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-6 font-sans">
          <div className="p-4 bg-white dark:bg-[#111111] border border-stone-150 dark:border-stone-850 rounded-sm shadow-xs">
            <h4 className="font-serif text-lg text-stone-900 dark:text-stone-100 mb-2">{t('about.uncutFreshness')}</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed font-sans">We do not freeze pre-made cakes. Every tier is baked fresh, layered, and decorated immediately before pickup.</p>
          </div>
          <div className="p-4 bg-white dark:bg-[#111111] border border-stone-150 dark:border-stone-850 rounded-sm shadow-xs">
            <h4 className="font-serif text-lg text-stone-900 dark:text-stone-100 mb-2">{t('about.organicIntegrity')}</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed font-sans">We partner with local organic Highland growers and small-scale cooperatives to source pure, high-quality ingredients.</p>
          </div>
          <div className="p-4 bg-white dark:bg-[#111111] border border-stone-150 dark:border-stone-850 rounded-sm shadow-xs">
            <h4 className="font-serif text-lg text-stone-900 dark:text-stone-100 mb-2 font-serif font-medium">{t('about.bespokeCuration')}</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed font-sans">Yodit coordinates each pre-scheduled pickup. We provide detailed travel recommendations to ensure your cake stays beautiful and perfect.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
