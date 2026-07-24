import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, ChevronRight, ChevronLeft, Star, Heart, Check, Award, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CakeGalleryItem } from '../../../types';
import { GALLERY_ITEMS, TESTIMONIALS } from '../../../data';
import { t } from '../../../i18n/index';
import { usePageTitle } from '../hooks/usePageTitle';

interface HomeViewProps {
  onSelectCake: (cake: CakeGalleryItem) => void;
}

export default function HomeView({ onSelectCake }: HomeViewProps) {
  const navigate = useNavigate();
  usePageTitle("Home");
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Auto scroll testimonials (resets interval on manual action)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [activeTestimonial]);

  const handleNextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handlePrevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const [featuredCakes, setFeaturedCakes] = useState<CakeGalleryItem[]>(GALLERY_ITEMS.slice(0, 3));

  // Load from Postgres backend if reachable, otherwise fall back gracefully
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/gallery');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.items && data.items.length > 0) {
            setFeaturedCakes(data.items.slice(0, 3));
          }
        }
      } catch (err) {
        console.warn('Postgres featured query offline, using local backup:', err);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-24 pb-16 overflow-hidden">
      
      {/* 1. HERO SECTION: Full-Bleed Dark & High-End Dramatic Mood */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#111111] text-white pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        
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
          <div className="absolute inset-0 bg-gradient-to-r from-[#120f0d] via-transparent to-[#120f0d]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#120f0d] via-transparent to-[#120f0d]/50" />
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
              {[
                { value: "500+", label: t('home.statsCakes') },
                { value: "5.0★", label: t('home.statsRating') },
                { value: "8+ Yrs", label: t('home.statsHeritage') },
              ].map((s) => (
                <div key={s.label} className="space-y-1.5">
                  <p className="font-serif text-3xl sm:text-4xl font-medium text-white drop-shadow-md">{s.value}</p>
                  <p className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#c5a880] font-semibold">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. SOCIAL PROOF STRIP: Elegant Trust Seals */}
      <section className="bg-stone-50 dark:bg-[#111111] border-y border-stone-200/50 dark:border-stone-850/80 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Star className="w-5 h-5 text-lux-gold" />, value: "500+", label: t('home.statsCakesHandcrafted') },
              { icon: <Heart className="w-5 h-5 text-lux-gold" />, value: "100%", label: t('home.statsMadeWithLove') },
              { icon: <Check className="w-5 h-5 text-lux-gold" />, value: "Fresh", label: t('home.statsPremiumIngredients') },
              { icon: <Award className="w-5 h-5 text-lux-gold" />, value: "5-Star", label: t('home.statsHappyClients') },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3.5 pl-2 sm:pl-4">
                <div className="w-10 h-10 rounded-full bg-lux-gold/10 flex items-center justify-center shrink-0 border border-lux-gold/15">
                  {item.icon}
                </div>
                <div className="text-left font-sans">
                  <p className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 leading-none">{item.value}</p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 font-light mt-1 tracking-wide">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FLAGSHIP COLLECTIONS: Beautiful Cakes For Every Occasion */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-[10px] uppercase tracking-[0.25em] text-lux-gold font-bold block mb-2 font-mono">{t('home.specialties')}</span>
          <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 dark:text-stone-100">{t('home.collectionsTitle')}</h2>
          <div className="h-[2px] w-12 bg-lux-gold mx-auto mt-4" />
          <p className="text-stone-550 dark:text-stone-400 text-xs font-light mt-3 leading-relaxed max-w-sm mx-auto">
            {t('home.collectionsDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Collection 1 */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-[#111111] p-6 shadow-sm hover:shadow-xl border border-stone-200/50 dark:border-stone-850 rounded-sm flex flex-col justify-between text-left"
          >
            <div>
              <div className="aspect-[4/5] overflow-hidden mb-6 relative group bg-stone-100 dark:bg-stone-900">
                <img
                  src="/gallery_wedding.png"
                  alt="Celebration Sculptures"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />
                <div className="absolute top-4 left-4 inline-block bg-stone-900/95 backdrop-blur-md px-3 py-1 text-[9px] uppercase tracking-widest font-mono text-lux-gold rounded-full font-semibold">
                  {t('home.bespokeBadge')}
                </div>
              </div>
              <h3 className="text-xl font-serif text-stone-900 dark:text-stone-100 mb-2">{t('home.celebrationSculptures')}</h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 font-light leading-relaxed mb-6 font-sans">
                {t('home.celebrationSculpturesDesc')}
              </p>
            </div>
            <Link
              to="/gallery"
              className="text-lux-gold text-xs uppercase tracking-widest font-semibold hover:text-stone-900 hover:dark:text-white transition-colors flex items-center gap-1.5 self-start mt-auto font-mono cursor-pointer"
            >
              {t('home.viewElegantTiers')} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Collection 2 */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-[#111111] p-6 shadow-sm hover:shadow-xl border border-stone-200/50 dark:border-stone-850 rounded-sm flex flex-col justify-between text-left"
          >
            <div>
              <div className="aspect-[4/5] overflow-hidden mb-6 relative group bg-stone-100 dark:bg-stone-900">
                <img
                  src="/gallery_birthday.png"
                  alt="Milestones & Birthdays"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />
                <div className="absolute top-4 left-4 inline-block bg-stone-900/95 backdrop-blur-md px-3 py-1 text-[9px] uppercase tracking-widest font-mono text-lux-gold rounded-full font-semibold">
                  {t('home.milestonesBadge')}
                </div>
              </div>
              <h3 className="text-xl font-serif text-stone-900 dark:text-stone-100 mb-2">{t('home.milestonesBirthdays')}</h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 font-light leading-relaxed mb-6 font-sans">
                {t('home.milestonesBirthdaysDesc')}
              </p>
            </div>
            <Link
              to="/gallery"
              className="text-lux-gold text-xs uppercase tracking-widest font-semibold hover:text-stone-900 hover:dark:text-white transition-colors flex items-center gap-1.5 self-start mt-auto font-mono cursor-pointer"
            >
              {t('home.viewModernCakes')} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Collection 3 */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-[#111111] p-6 shadow-sm hover:shadow-xl border border-stone-200/50 dark:border-stone-850 rounded-sm flex flex-col justify-between text-left"
          >
            <div>
              <div className="aspect-[4/5] overflow-hidden mb-6 relative group bg-stone-100 dark:bg-stone-900">
                <img
                  src="/gallery_treats.png"
                  alt="Cookies & Treats"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />
                <div className="absolute top-4 left-4 inline-block bg-stone-900/95 backdrop-blur-md px-3 py-1 text-[9px] uppercase tracking-widest font-mono text-lux-gold rounded-full font-semibold">
                  {t('home.petitFoursBadge')}
                </div>
              </div>
              <h3 className="text-xl font-serif text-stone-900 dark:text-stone-100 mb-2">{t('home.cookiesTreats')}</h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 font-light leading-relaxed mb-6 font-sans">
                {t('home.cookiesTreatsDesc')}
              </p>
            </div>
            <Link
              to="/gallery"
              className="text-lux-gold text-xs uppercase tracking-widest font-semibold hover:text-stone-900 hover:dark:text-white transition-colors flex items-center gap-1.5 self-start mt-auto font-mono cursor-pointer"
            >
              {t('home.viewGourmetSweets')} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 4. THE BESPOKE PHILOSOPHY: The Standard of Excellence & Sourcing */}
      <section className="bg-[#111111] text-white py-24 relative overflow-hidden">
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
              <div className="absolute -bottom-6 -left-6 bg-[#c5a880] text-stone-950 p-5 rounded-xs shadow-2xl max-w-[210px] text-left border border-white/10">
                <p className="font-serif text-3xl font-bold text-stone-950 leading-none">8+ Yrs</p>
                <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-900/80 mt-1">{t('home.dedicatedStudio')}</p>
                <p className="text-[9px] text-stone-850 font-light mt-1.5 font-sans leading-snug">{t('home.dedicatedStudioDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PROCESS SECTION: Dashed Guidelines and Steps */}
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

          {/* Step 1 */}
          <div className="relative z-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-stone-900 border border-lux-gold text-lux-gold flex items-center justify-center mx-auto text-xl font-serif shadow-md">
              01
            </div>
            <h3 className="text-lg font-serif font-semibold text-[#1c1917] dark:text-stone-100">{t('home.step1Title')}</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-light leading-relaxed max-w-xs mx-auto">
              {t('home.step1Desc')}
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-lux-gold text-stone-950 flex items-center justify-center mx-auto text-xl font-serif shadow-lg">
              02
            </div>
            <h3 className="text-lg font-serif font-semibold text-[#1c1917] dark:text-stone-100">{t('home.step2Title')}</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-light leading-relaxed max-w-xs mx-auto">
              {t('home.step2Desc')}
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-stone-900 border border-lux-gold text-lux-gold flex items-center justify-center mx-auto text-xl font-serif shadow-md">
              03
            </div>
            <h3 className="text-lg font-serif font-semibold text-[#1c1917] dark:text-stone-100">{t('home.step3Title')}</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-light leading-relaxed max-w-xs mx-auto">
              {t('home.step3Desc')}
            </p>
          </div>
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

      {/* 6. CURATED SHOWCASE (Bento Asymmetrical Preview Grid) */}
      <section className="bg-stone-50 dark:bg-[#111111] py-20 relative border-y border-stone-200/50 dark:border-stone-850/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-12 border-b border-stone-200 dark:border-stone-850 pb-6 text-left">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-lux-gold font-bold block mb-2 font-mono">{t('home.portfolioSubtitle')}</span>
              <h2 className="text-3xl font-serif text-stone-900 dark:text-stone-100">{t('home.portfolioTitle')}</h2>
            </div>
            <Link
              to="/gallery"
              className="text-stone-900 dark:text-stone-200 text-xs font-semibold uppercase tracking-widest hover:text-lux-gold dark:hover:text-lux-gold transition-colors flex items-center gap-1 mt-4 sm:mt-0 cursor-pointer font-mono"
            >
              {t('home.explorePortfolio')}
              <ChevronRight className="w-4 h-4 text-lux-gold" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCakes.map((cake) => (
              <div
                key={cake.id}
                className="group cursor-pointer text-left bg-white dark:bg-[#111111] border border-stone-200/60 dark:border-stone-850/70 p-4 rounded-sm shadow-xs transition-all duration-300 hover:shadow-xl"
                onClick={() => {
                  onSelectCake(cake);
                  navigate('/gallery');
                }}
              >
                <div className="aspect-[3/4] overflow-hidden mb-4 relative bg-stone-100 dark:bg-stone-900 rounded-sm">
                  <img
                    src={cake.image}
                    alt={cake.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-stone-900/90 backdrop-blur-md text-lux-gold text-[9px] uppercase font-mono tracking-widest rounded-full border border-stone-800">
                    {typeof cake.category === 'string' ? cake.category : cake.category?.name}
                  </div>
                </div>
                <div className="flex justify-between items-start pt-1.5 font-sans">
                  <div>
                    <h4 className="font-serif text-lg text-stone-900 dark:text-stone-100 group-hover:text-lux-gold transition-colors font-semibold">{cake.name}</h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-light mt-1 font-sans">{cake.servingCount}</p>
                  </div>
                  <span className="font-mono text-xs text-lux-gold font-bold bg-lux-gold/10 px-2 py-1 rounded-sm border border-lux-gold/15 shrink-0">{cake.priceEstimate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. SWEETEST STORIES: Refined Quotation Carousel */}
      <section className="relative bg-[#1a1613] py-24 text-white overflow-hidden">
        {/* Ambient background watermark watermark label */}
        <div className="absolute top-1/2 left-1/2 -track-wide -translate-x-1/2 -translate-y-1/2 opacity-[0.015] font-serif text-[18rem] uppercase select-none pointer-events-none">
          Custom
        </div>

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center font-sans">
          <span className="text-[10px] uppercase tracking-[0.25em] text-lux-gold font-mono block mb-8 font-semibold">{t('home.sweetestCelebrations')}</span>

          <div className="relative min-h-[290px] sm:min-h-[260px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {TESTIMONIALS.map((t, idx) => {
                if (idx !== activeTestimonial) return null;
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.01, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-center gap-0.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} size={15} className="fill-[#c5a880] text-[#c5a880]" />
                      ))}
                    </div>

                    <blockquote className="text-lg sm:text-xl lg:text-2xl font-serif font-light leading-relaxed max-w-3xl mx-auto italic text-stone-100">
                      "{t.content}"
                    </blockquote>

                    <div className="flex items-center justify-center gap-4 pt-4 text-left">
                      <img
                        src={t.image}
                        alt={t.author}
                        className="w-11 h-11 rounded-full object-cover border-2 border-lux-gold/30 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <cite className="not-italic font-semibold text-sm tracking-wide block text-white font-serif">{t.author}</cite>
                        <span className="text-xs text-stone-400 font-light block font-sans mt-0.5">{t.eventType} — {t.role}</span>
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
              onClick={handlePrevTestimonial}
              className="p-2 border border-white/10 hover:border-lux-gold rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-all cursor-pointer"
              aria-label="Previous review"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1.5">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${activeTestimonial === idx ? 'w-6 bg-lux-gold' : 'w-1.5 bg-white/20'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={handleNextTestimonial}
              className="p-2 border border-white/10 hover:border-lux-gold rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-all cursor-pointer"
              aria-label="Next review"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA: Dramatic espresso canvas with gold heading */}
      <section className="relative py-28 overflow-hidden rounded-xs bg-[#111111]">
        <div className="absolute inset-0 select-none opacity-20">
          <img
            src="https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&q=80&w=1200"
            alt="Event decor detail"
            className="w-full h-full object-cover scale-102"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-[#111111]/80" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-5 text-center font-sans space-y-6">
          <span className="text-[10px] uppercase tracking-[0.35em] text-lux-gold font-bold font-mono">{t('home.ctaSuperTitle')}</span>
          
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            {t('home.ctaTitle')} <br />
            <span className="text-[#c5a880] italic">{t('home.ctaSubtitle')}</span>
          </h2>
          
          <p className="text-stone-300 font-light text-sm sm:text-base mb-10 max-w-md mx-auto leading-relaxed">
            {t('home.ctaDesc')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              to="/request"
              className="bg-lux-gold text-[#120f0d] font-semibold px-8 py-4 rounded-sm hover:bg-white hover:text-stone-950 transition-all hover:shadow-[0_8px_32px_rgba(197,168,128,0.25)] flex items-center justify-center gap-2 cursor-pointer font-mono text-xs uppercase tracking-wider"
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
    </div>
  );
}

