import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, Search, ArrowRight, ShieldCheck, UserCircle, MessageSquare, CheckCircle2 } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { Link } from 'react-router-dom';
import { FAQS } from '@client/content/faqs';
import { t } from '@client/i18n/index';

export default function HelpView() {
  usePageTitle("Help & Guide");

  // Accordion faq category state and search inputs
  const [activeFaq, setActiveFaq] = useState<string | null>(null);
  const [faqCategory, setFaqCategory] = useState<string>('all');
  const [faqSearch, setFaqSearch] = useState<string>('');

  const toggleFaq = (id: string) => {
    setActiveFaq((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-24 pb-16 font-sans">
      {/* Hero Section */}
      <section className="bg-stone-900 text-white py-20 relative overflow-hidden">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[30vw] h-[30vw] rounded-full border border-white/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <span className="text-[10px] uppercase tracking-[0.3em] text-lux-gold font-mono block mb-2 font-bold">Support & Guide</span>
          <h1 className="text-4xl sm:text-5xl font-serif text-white mb-6">How to Use Flavour Bites</h1>
          <div className="h-[2px] w-12 bg-lux-gold mx-auto mb-6" />
          <p className="text-stone-400 text-sm font-light max-w-lg mx-auto leading-relaxed">
            A step-by-step guide to ordering, tracking, and understanding our custom cake process. Save time by finding exactly what you need right here.
          </p>
        </div>
      </section>

      {/* Specific Guides Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="space-y-16">
          
          {/* Guide 1: Requesting a Cake */}
          <div className="bg-white dark:bg-stone-950 border border-stone-200/60 dark:border-stone-850 rounded-sm p-8 md:p-10 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 dark:bg-stone-900 rounded-full blur-3xl -z-10" />
            <h2 className="text-2xl md:text-3xl font-serif text-stone-900 dark:text-stone-100 mb-2">How to Request a Custom Cake</h2>
            <p className="text-stone-500 dark:text-stone-400 font-light mb-8 text-sm">Follow these exact steps to create your dream cake without the hassle.</p>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-stone-900 dark:bg-stone-800 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 border border-stone-800 dark:border-stone-700">1</div>
                <div>
                  <h4 className="font-serif text-lg text-stone-900 dark:text-stone-200 mb-1">Browse or Create Your Design</h4>
                  <p className="text-sm text-stone-600 dark:text-stone-400 font-light">Look through our <Link to="/gallery" className="text-lux-gold hover:underline">Cake Gallery</Link> to find inspiration, or click "Order a Custom Cake" to start from scratch. Note the style, colors, and flavors you want.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-stone-900 dark:bg-stone-800 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 border border-stone-800 dark:border-stone-700">2</div>
                <div>
                  <h4 className="font-serif text-lg text-stone-900 dark:text-stone-200 mb-1">Fill out the Request Form</h4>
                  <p className="text-sm text-stone-600 dark:text-stone-400 font-light">Navigate to the <Link to="/request" className="text-lux-gold hover:underline">Order Form</Link>. We need your exact event date, the estimated number of guests, and your preferred cake style.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-stone-900 dark:bg-stone-800 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 border border-stone-800 dark:border-stone-700">3</div>
                <div>
                  <h4 className="font-serif text-lg text-stone-900 dark:text-stone-200 mb-1">Wait for Yodit's Review & Price</h4>
                  <p className="text-sm text-stone-600 dark:text-stone-400 font-light">Once you submit, your order status becomes <span className="font-mono text-xs bg-stone-100 dark:bg-stone-800 px-1 rounded text-stone-600 dark:text-stone-300">Request Received</span>. Yodit will review your design and reply directly to your Phone or Telegram within 24 hours with an exact price.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-stone-900 dark:bg-stone-800 text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 border border-stone-800 dark:border-stone-700">4</div>
                <div>
                  <h4 className="font-serif text-lg text-stone-900 dark:text-stone-200 mb-1">Confirm and Bake</h4>
                  <p className="text-sm text-stone-600 dark:text-stone-400 font-light">After you confirm the price and pay the deposit, your status updates to <span className="font-mono text-xs bg-stone-100 dark:bg-stone-800 px-1 rounded text-stone-600 dark:text-stone-300">Order Confirmed</span>. We will start baking your cake 48 hours before your event!</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-850">
              <Link to="/request" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-lux-gold hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                Start a Request Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Guide 2: Tracking an Order */}
          <div className="bg-stone-50 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-850 rounded-sm p-8 md:p-10 shadow-xs">
            <h2 className="text-2xl md:text-3xl font-serif text-stone-900 dark:text-stone-100 mb-2">How to Track Your Active Order</h2>
            <p className="text-stone-500 dark:text-stone-400 font-light mb-8 text-sm">Don't call to ask if your cake is ready! You can see its live status right on our website.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <UserCircle className="w-8 h-8 text-lux-gold mb-2" />
                <h4 className="font-serif text-base text-stone-900 dark:text-stone-200">1. Sign In</h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 font-light">Click 'Sign In' at the top right of the website. For security and notifications, you must authenticate using your Telegram account.</p>
              </div>

              <div className="space-y-3">
                <ShieldCheck className="w-8 h-8 text-lux-gold mb-2" />
                <h4 className="font-serif text-base text-stone-900 dark:text-stone-200">2. Go to My Profile</h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 font-light">Once signed in, click on your profile to access your dashboard. Your active requests and orders are listed securely there.</p>
              </div>

              <div className="space-y-3">
                <CheckCircle2 className="w-8 h-8 text-lux-gold mb-2" />
                <h4 className="font-serif text-base text-stone-900 dark:text-stone-200">3. View Live Status</h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 font-light">Click on any order to see if it is <span className="font-mono">Being Designed</span>, <span className="font-mono">Being Baked</span>, or <span className="font-mono">Ready for Pickup</span>.</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800">
              <Link to="/auth" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-lux-gold hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                Sign in to Track Orders <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* FAQs Panel Migrated from ContactView */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 font-sans">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] uppercase tracking-[0.3em] text-lux-gold font-mono block mb-2 font-semibold font-bold">{t('contact.studioPolicies')}</span>
          <h2 className="text-3xl font-serif text-warm-950 dark:text-stone-100">{t('contact.faqHeader')}</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 font-light mt-2 font-sans">{t('contact.faqDescription')}</p>
          <div className="h-[2px] w-12 bg-lux-gold mx-auto mt-4" />
        </div>

        {/* Dynamic FAQ Search and Category Filters */}
        <div className="mb-10 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder={t('contact.searchPolicies')}
              aria-label={t('contact.searchPolicies')}
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full bg-stone-50/75 dark:bg-stone-900/60 border border-stone-250/70 dark:border-stone-800 pl-10 pr-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-lux-gold focus:border-lux-gold rounded-sm transition-all text-stone-850 dark:text-stone-100 placeholder-stone-400"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-1.5 pt-2">
            {[
              { id: 'all', label: t('contact.allPolicies'), match: ['all'] },
              { id: 'booking', label: t('contact.leadTimesBooking'), match: ['booking', 'ordering', 'cancellation'] },
              { id: 'pricing', label: t('contact.pricingCosts'), match: ['pricing'] },
              { id: 'studio', label: t('contact.studioLocation'), match: ['studio'] },
              { id: 'dietary', label: t('contact.ingredientsDietary'), match: ['dietary', 'care'] }
            ].map((cat) => {
              const isActive = faqCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setFaqCategory(cat.id);
                    setActiveFaq(null); // Close active question when switching category
                  }}
                  className={`px-3 py-1.5 text-[10px] uppercase font-mono tracking-widest font-bold border rounded-xs transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-lux-gold text-stone-950 border-lux-gold shadow-xs'
                      : 'bg-white dark:bg-stone-950 hover:bg-stone-50 dark:hover:bg-stone-900 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 border-stone-200 dark:border-stone-800'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Accordion List Display */}
        {(() => {
          const activeCategoryObj = [
            { id: 'all', match: ['all'] },
            { id: 'booking', match: ['booking', 'ordering', 'cancellation'] },
            { id: 'pricing', match: ['pricing'] },
            { id: 'studio', match: ['studio'] },
            { id: 'dietary', match: ['dietary', 'care'] }
          ].find(c => c.id === faqCategory) || { match: ['all'] };

          const filteredFaqs = FAQS.filter((faq) => {
            const matchesCategory = faqCategory === 'all' || activeCategoryObj.match.includes(faq.category);
            const matchesSearch =
              faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
              faq.answer.toLowerCase().includes(faqSearch.toLowerCase());
            return matchesCategory && matchesSearch;
          });

          if (filteredFaqs.length === 0) {
            return (
              <div className="text-center py-12 bg-stone-50 dark:bg-stone-900/40 border border-dashed border-stone-200 dark:border-stone-800 rounded-sm">
                <HelpCircle className="w-8 h-8 text-stone-300 dark:text-stone-700 mx-auto mb-2" />
                <p className="text-xs text-stone-500 dark:text-stone-400 font-light font-sans">{t('contact.noMatching')}</p>
                <button
                  onClick={() => { setFaqSearch(''); setFaqCategory('all'); }}
                  className="text-[10px] uppercase tracking-wider font-mono text-lux-gold font-bold underline mt-2 cursor-pointer"
                >
                  {t('contact.resetFilter')}
                </button>
              </div>
            );
          }

          return (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = activeFaq === faq.id;
                return (
                  <div key={faq.id} className="bg-white dark:bg-stone-950 border border-stone-200/70 dark:border-stone-800 rounded-xs shadow-xs overflow-hidden transition-all duration-200 hover:border-stone-300 dark:hover:border-stone-700">
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/30 dark:hover:bg-stone-900/40 transition-colors font-sans"
                    >
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-4 h-4 text-lux-gold shrink-0" />
                        <span className="font-serif text-base text-stone-900 dark:text-stone-105 font-medium font-serif">{faq.question}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-stone-900 dark:text-stone-200' : ''}`} />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="p-5 pt-0 border-t border-stone-100/70 dark:border-stone-800/70 text-xs text-stone-600 dark:text-stone-400 font-light leading-relaxed space-y-2 font-sans text-left">
                            <p className="font-sans text-stone-650 dark:text-stone-300 leading-relaxed">{faq.answer}</p>
                            <span className="inline-block text-[10px] uppercase tracking-widest font-mono text-lux-gold bg-lux-gold/10 px-2.5 py-0.5 rounded-sm mt-3 font-semibold font-bold">
                              {t('contact.topic')}: {faq.category}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </section>
    </div>
  );
}
