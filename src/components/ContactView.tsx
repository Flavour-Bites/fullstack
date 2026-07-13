import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, Mail, MapPin, Phone, HelpCircle, Check, ChevronDown, CheckCircle2, Calculator, Map, ShieldAlert, Search, Loader2 } from 'lucide-react';
import { FAQS } from '../data';
import { t } from '../i18n';

export default function ContactView() {
  const [activeFaq, setActiveFaq] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: 'Consultation', message: '' });
  const [valError, setValError] = useState<string | null>(null);

  // Accordion faq category state and search inputs
  const [faqCategory, setFaqCategory] = useState<string>('all');
  const [faqSearch, setFaqSearch] = useState<string>('');

  // Sub-City Delivery calculator state
  const [subCityInput, setSubCityInput] = useState('');
  const [calcResult, setCalcResult] = useState<{ zone: string; price: string; info: string; success: boolean } | null>(null);

  const toggleFaq = (id: string) => {
    setActiveFaq((prev) => (prev === id ? null : id));
  };

  const handleSubCityCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCityInput.trim()) return;

    const query = subCityInput.trim().toLowerCase();

    if (query.includes('arada') || query.includes('kirkos') || query.includes('lideta') || query.includes('arada')) {
      setCalcResult({
        zone: 'Core Sub-Cities (Zone 1)',
        price: 'Included / Free Pickup',
        info: 'Your location is close to our home studio. Pickup is fully complimentary, or hand-guarded transport can be proposed.',
        success: true
      });
    } else if (query.includes('bole') || query.includes('yeka') || query.includes('nifas') || query.includes('lafto')) {
      setCalcResult({
        zone: 'East & South Hubs (Zone 2)',
        price: '450 ETB',
        info: 'Pickup slots are open Tuesday—Saturday. Optional delivery can be co-arranged upon request review.',
        success: true
      });
    } else if (query.includes('gullele') || query.includes('kolfe') || query.includes('akaki') || query.includes('kality')) {
      setCalcResult({
        zone: 'Outer Perimeter Sub-Cities (Zone 3)',
        price: '650 ETB',
        info: 'Requires extra coordination to protect cake heights during transit. Studio pickup remains default.',
        success: true
      });
    } else {
      setCalcResult({
        zone: 'Regional Custom Perimeter (Zone 4)',
        price: 'By Custom Proposal',
        info: 'Outside standard Addis Ababa sub-city zones. We organize custom pickup times or travel-boxing guidelines.',
        success: false
      });
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setValError('Please fill out Name, Email, and Message.');
      return;
    }
    setValError(null);
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to send message');
      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setContactForm({ name: '', email: '', subject: 'Consultation', message: '' });
      }, 15000);
    } catch (err: any) {
      setValError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-24 pb-16">
      {/* Intro Header */}
      <section className="text-center max-w-2xl mx-auto pt-6 px-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-lux-gold/20 bg-lux-gold/10 mb-4 font-sans font-medium">
          <Sparkles className="w-3.5 h-3.5 text-lux-gold" />
          <span className="text-[10px] uppercase tracking-[0.25em] text-lux-gold font-semibold">{t('contact.getInTouch')}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif text-warm-950 dark:text-stone-100 mb-3">{t('contact.title')}</h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 font-light leading-relaxed max-w-lg mx-auto font-sans">
          Message us here or on Telegram. Yodit Ashenafi checks your messages daily to find booking times.
        </p>
        <div className="h-[1px] w-24 bg-stone-300 mx-auto mt-6" />
      </section>

      {/* Main Grid: Form, Info & map */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white dark:bg-[#111111] p-8 border border-stone-200/60 dark:border-stone-850 rounded-sm shadow-xs space-y-6">
              <h2 className="font-serif text-2xl text-warm-950 dark:text-stone-100">{t('contact.coordinates')}</h2>
              <div className="h-[2px] w-12 bg-lux-gold" />

              <div className="space-y-6 text-sm text-stone-600 dark:text-stone-350 font-sans font-light text-left">
                <div className="flex gap-4 items-start">
                  <MapPin className="w-5 h-5 text-lux-gold shrink-0 mt-0.5" />
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-widest text-stone-400 dark:text-stone-500 font-semibold block mb-0.5">{t('contact.studioLocation')}</label>
                    <p className="text-stone-850 dark:text-stone-150 font-medium">Flavour Bites Custom Studio</p>
                    {/* [NEEDS INPUT: specific city / sub-city details - current Bole, Addis Ababa is placeholder] */}
                    <p className="dark:text-stone-300">Bole Sub-City</p>
                    <p className="dark:text-stone-300">Addis Ababa, Ethiopia</p>
                  </div>
                </div>

                {/* Visible Telegram contact option (icon + label) next to email/phone blocks */}
                <div className="flex gap-4 items-start">
                  <Send className="w-5 h-5 text-lux-gold shrink-0 mt-0.5 rotate-[-25deg]" />
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-widest text-[#c5a880] font-semibold block mb-0.5">{t('contact.telegramChannel')}</label>
                    {/* [NEEDS INPUT: actual Telegram handle/link] */}
                    <p className="font-semibold text-stone-800 dark:text-stone-200">
                      <a href="https://t.me/flavourbites_placeholder" target="_blank" rel="noopener noreferrer" className="hover:text-lux-gold transition-colors underline">
                        @flavourbites_placeholder
                      </a>
                    </p>
                    <span className="text-[11px] text-stone-400 dark:text-stone-500">Our preferred and quickest notification channel.</span>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <Mail className="w-5 h-5 text-lux-gold shrink-0 mt-0.5" />
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-widest text-stone-400 dark:text-stone-500 font-semibold block mb-0.5">{t('contact.inquiriesMailbox')}</label>
                    {/* [NEEDS INPUT: actual professional email] */}
                    <p className="font-mono dark:text-stone-300">hello@flavourbites_placeholder.com</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <Phone className="w-5 h-5 text-lux-gold shrink-0 mt-0.5" />
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-widest text-stone-400 dark:text-stone-500 font-semibold block mb-0.5">{t('contact.directVoice')}</label>
                    {/* [NEEDS INPUT: actual phone number] */}
                    <p className="font-mono text-stone-800 dark:text-stone-150 font-semibold">+251 911 000 000</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 font-light">(Tuesday — Saturday, 10:00 - 18:00)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Zone Sube-City LookUp */}
            <div className="bg-stone-900 text-white p-8 rounded-sm shadow-xl space-y-4 border border-stone-800 font-sans">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-lux-gold" />
                <h3 className="font-serif text-lg text-white">{t('contact.subCityLookup')}</h3>
              </div>
              <p className="text-xs text-stone-400 font-light leading-relaxed font-sans">
                {t('contact.typeSubCity')}
              </p>

              <form onSubmit={handleSubCityCheck} className="flex gap-2 font-sans">
                <input
                  type="text"
                  placeholder="e.g. Bole, Kirkos"
                  aria-label="Sub-city lookup"
                  value={subCityInput}
                  onChange={(e) => setSubCityInput(e.target.value)}
                  className="bg-stone-850 border border-stone-750 text-white p-3 text-xs w-full focus:outline-none focus:border-lux-gold rounded-sm uppercase"
                />
                <button
                  type="submit"
                  className="px-4 bg-lux-gold text-warm-950 text-xs font-semibold uppercase tracking-widest rounded-sm hover:opacity-90 cursor-pointer"
                >
                  {t('common.verify')}
                </button>
              </form>

              {calcResult && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-stone-850 rounded-xs border border-stone-800 space-y-2 text-xs font-sans"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-stone-400 text-[10px] uppercase">Jurisdiction Area</span>
                    <span className="font-mono text-lux-gold font-semibold">{calcResult.zone}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-stone-800 pt-2">
                    <span className="font-mono text-stone-400 text-[10px] uppercase">Logistic Rate</span>
                    <span className="text-sm font-serif font-semibold text-white">{calcResult.price}</span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-relaxed pt-1 border-t border-stone-800">
                    {calcResult.info}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Interactive general Contact Form Column */}
          <div className="lg:col-span-7 bg-white dark:bg-[#111111] p-8 sm:p-10 border border-stone-200/60 dark:border-stone-850 rounded-sm shadow-xs text-left">
            <AnimatePresence mode="wait">
              {formSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16 space-y-6 font-sans"
                >
                  <div className="w-16 h-16 bg-green-50 dark:bg-green-950/20 rounded-full flex items-center justify-center mx-auto border border-green-200 dark:border-green-905">
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-serif text-stone-900 dark:text-stone-100">{t('contact.messageReceived')}</h3>
                  <p className="text-sm text-stone-600 dark:text-stone-300 max-w-md mx-auto font-light leading-relaxed">
                    Yodit Ashenafi has received your message. She answers questions daily and will message you back on phone or Telegram within 24 hours.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="px-6 py-2 bg-stone-900 dark:bg-stone-800 text-white font-medium text-xs tracking-widest uppercase rounded-sm hover:bg-stone-800 dark:hover:bg-stone-701 font-semibold"
                  >
                    {t('contact.sendAnother')}
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-6 font-sans" id="contact-general-form">
                  {valError && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-450 text-xs rounded-sm font-sans flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{valError}</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-[#c5a880] font-mono block font-semibold">DIRECT MESSAGE LINK</span>
                      <h2 className="font-serif text-2xl text-stone-900 dark:text-stone-100">{t('contact.sendStudioNote')}</h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-light font-sans">Have general questions or custom recipe questions?</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-450 font-bold block mb-1">{t('contact.nameLabel')}</label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="e.g. Sabontu Tesfaye"
                        className="w-full border border-stone-200 dark:border-stone-800 p-3 text-sm focus:outline-none focus:border-lux-gold bg-stone-50/50 dark:bg-stone-900/60 rounded-sm text-stone-850 dark:text-stone-100 placeholder-stone-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-450 font-bold block mb-1">{t('contact.emailLabel')}</label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="e.g. sabontu@example.com"
                        className="w-full border border-stone-200 dark:border-stone-800 p-3 text-sm focus:outline-none focus:border-lux-gold bg-stone-50/50 dark:bg-stone-900/60 rounded-sm text-stone-850 dark:text-stone-100 placeholder-stone-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-450 font-bold block mb-1">{t('contact.subject')}</label>
                    <select
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full border border-stone-200 dark:border-stone-800 p-3 text-sm focus:outline-none focus:border-lux-gold bg-white dark:bg-stone-900 rounded-sm text-stone-850 dark:text-stone-100"
                    >
                      <option value="Consultation">Custom Design Review</option>
                      <option value="Dietary">Diet Requirements</option>
                      <option value="Other">General Questions</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-450 font-bold block mb-1">{t('contact.messageBody')}</label>
                    <textarea
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      rows={4}
                      placeholder="Type your message here..."
                      className="w-full border border-stone-200 dark:border-stone-800 p-3 text-sm focus:outline-none focus:border-lux-gold bg-stone-50/50 dark:bg-stone-900/60 rounded-sm text-stone-850 dark:text-stone-100 placeholder-stone-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-4 bg-stone-900 dark:bg-stone-800 hover:bg-stone-850 dark:hover:bg-stone-700 text-white font-medium text-xs tracking-[0.25em] uppercase rounded-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? <Loader2 className="w-4 h-4 text-lux-gold animate-spin" /> : <Send className="w-4 h-4 text-lux-gold" />}
                    {sending ? 'Sending...' : t('contact.send')}
                  </button>
                </form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Stylized Vector Addis Ababa Service Area Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#1e1a15] text-white p-8 sm:p-12 rounded-sm border border-stone-800 relative z-10 overflow-hidden font-sans">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5 font-sans">
                <Map className="w-3.5 h-3.5 text-lux-gold" />
                <span className="text-[9px] uppercase tracking-[0.25em] text-stone-300 font-mono font-semibold">{t('contact.serviceArea')}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif text-white">{t('contact.addisAbabaIngress')}</h2>
              <p className="text-sm text-stone-400 font-light leading-relaxed font-sans">
                Operating from our home custom studio in Bole Sub-City, we manage secure collection schedule slots. All our custom cakes are packaged in high-care secure travel-boxes to survive transit. Optional delivery within the perimeter can be custom-coordinated on request slots.
              </p>
              <div className="space-y-3 pt-2 text-xs font-light text-stone-300 font-sans">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-lux-gold shrink-0" />
                  <span>Inner Sub-City Coordinates: Bole, Kirkos, Arada, Lideta, Yeka.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-lux-gold shrink-0" />
                  <span>Outer Perimeter: Nifas Silk-Lafto, Gullele, Kolfe Keranio, Akaki Kality.</span>
                </div>
              </div>
            </div>

            {/* Stylized Vector Coordinate SVG map rendering Addis Ababa landmarks */}
            <div className="relative aspect-square sm:aspect-[4/3] bg-stone-950 rounded-sm overflow-hidden border border-stone-800 p-4 flex items-center justify-center">
              <svg className="w-full h-full max-h-[300px] text-stone-700/30" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Ring traces representing sub-city splits */}
                <circle cx="200" cy="150" r="120" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx="200" cy="150" r="75" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1" />
                <circle cx="200" cy="150" r="30" stroke="#c5a880" strokeOpacity="0.2" strokeWidth="1.5" />

                {/* Grid lines */}
                <line x1="200" y1="10" x2="200" y2="290" stroke="#ffffff" strokeOpacity="0.03" strokeWidth="1" />
                <line x1="10" y1="150" x2="390" y2="150" stroke="#ffffff" strokeOpacity="0.03" strokeWidth="1" />

                {/* Coordinates */}
                <circle cx="200" cy="150" r="5" fill="#c5a880" />
                <text x="210" y="146" fill="#c5a880" fontSize="9" fontWeight="bold" fontFamily="monospace" letterSpacing="1">BOLE (STUDIO)</text>

                <circle cx="150" cy="120" r="3" fill="#ffffff" fillOpacity="0.7" />
                <text x="110" y="115" fill="#ffffff" fillOpacity="0.6" fontSize="8" fontFamily="sans-serif">Arada Zone</text>

                <circle cx="250" cy="180" r="3" fill="#ffffff" fillOpacity="0.7" />
                <text x="258" y="184" fill="#ffffff" fillOpacity="0.6" fontSize="8" fontFamily="sans-serif">Yeka Zone</text>

                <circle cx="100" cy="200" r="3" fill="#ffffff" fillOpacity="0.5" />
                <text x="108" y="203" fill="#ffffff" fillOpacity="0.4" fontSize="7" fontFamily="sans-serif">Nifas Silk Area</text>

                <circle cx="290" cy="90" r="3" fill="#ffffff" fillOpacity="0.5" />
                <text x="298" y="93" fill="#ffffff" fillOpacity="0.4" fontSize="7" fontFamily="sans-serif">Lemi Kura Ring</text>

                {/* Pulse circle for Bole center */}
                <circle cx="200" cy="150" r="10" stroke="#c5a880" strokeWidth="1">
                  <animate attributeName="r" values="5;18;5" dur="4.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0;0.8" dur="4.2s" repeatCount="indefinite" />
                </circle>
              </svg>
              <div className="absolute top-4 left-4 text-[9px] uppercase tracking-widest text-stone-400 font-mono bg-stone-900/90 py-1 px-2 border border-stone-800">
                Studio Coordinate Grid 0.0
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Panel */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 font-sans">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] uppercase tracking-[0.3em] text-lux-gold font-mono block mb-2 font-semibold font-bold">{t('contact.studioPolicies')}</span>
          <h2 className="text-3xl font-serif text-warm-950 dark:text-stone-100">Frequently Asked Questions</h2>
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
              { id: 'all', label: t('contact.allPolicies') },
              { id: 'Lead-Times & Process', label: 'Lead Times & Booking' },
              { id: 'Pricing & Estimates', label: 'Pricing & Costs' },
              { id: 'Delivery & Logistics', label: 'Delivery & Logistics' },
              { id: 'Ingredients & Dietary', label: 'Ingredients & Dietary' }
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
                      : 'bg-white dark:bg-[#111111] hover:bg-stone-50 dark:hover:bg-stone-900 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 border-stone-200 dark:border-stone-800'
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
          const filteredFaqs = FAQS.filter((faq) => {
            const matchesCategory = faqCategory === 'all' || faq.category === faqCategory;
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
                  className="text-[10px] uppercase tracking-wider font-mono text-lux-gold font-bold underline mt-2"
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
                  <div key={faq.id} className="bg-white dark:bg-[#111111] border border-stone-200/70 dark:border-stone-800 rounded-xs shadow-xs overflow-hidden transition-all duration-200 hover:border-stone-300 dark:hover:border-stone-700">
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/30 dark:hover:bg-stone-900/40 transition-colors font-sans"
                    >
                      <div className="flex items-center gap-3">
                        <HelpCircle className="w-4 h-4 text-lux-gold shrink-0" />
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
