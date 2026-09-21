import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mail, MapPin, Phone, Check, CheckCircle2, ShieldAlert, Loader2, ExternalLink, Navigation } from 'lucide-react';
import { t } from '@client/i18n/index';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { BUSINESS_INFO } from '../../../../shared/constants/index';
import { http, type ApiResponse } from '@/shared/api';

export default function ContactView() {
  usePageTitle("Contact");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: 'Consultation', message: '' });
  const [valError, setValError] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setValError('Please fill out Name, Email, and Message.');
      return;
    }
    setValError(null);
    setSending(true);
    try {
      const { data } = await http.post<ApiResponse>('/api/contact', contactForm);
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
        <h1 className="text-4xl sm:text-5xl font-serif text-warm-950 dark:text-stone-100 mb-3">{t('contact.title')}</h1>
        <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 font-light leading-relaxed max-w-lg mx-auto font-sans">
          {t('contact.getInTouch')} — {t('contact.yoditChecks')}
        </p>
        <div className="h-[1px] w-24 bg-stone-300 mx-auto mt-6" />
      </section>

      {/* Main Grid: Form, Info & map */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white dark:bg-stone-950 p-8 border border-stone-200/60 dark:border-stone-850 rounded-sm shadow-xs space-y-6">
              <h2 className="font-serif text-2xl text-warm-950 dark:text-stone-100">{t('contact.coordinates')}</h2>
              <div className="h-[2px] w-12 bg-lux-gold" />

              <div className="space-y-6 text-sm text-stone-600 dark:text-stone-350 font-sans font-light text-left">
                <div className="flex gap-4 items-start">
                  <MapPin className="w-5 h-5 text-lux-gold shrink-0 mt-0.5" />
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-widest text-stone-400 dark:text-stone-500 font-semibold block mb-0.5">{t('contact.studioLocation')}</label>
                    <p className="text-stone-850 dark:text-stone-150 font-medium">{BUSINESS_INFO.location.name}</p>
                    <p className="dark:text-stone-300">{BUSINESS_INFO.location.area}, {BUSINESS_INFO.location.subCity}</p>
                    <p className="dark:text-stone-300">{BUSINESS_INFO.location.city}, {BUSINESS_INFO.location.country}</p>
                  </div>
                </div>

                {/* Visible Telegram contact option (icon + label) next to email/phone blocks */}
                <div className="flex gap-4 items-start">
                  <Send className="w-5 h-5 text-lux-gold shrink-0 mt-0.5 rotate-[-25deg]" />
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-widest text-lux-gold font-semibold block mb-0.5">{t('contact.telegramChannel')}</label>
                    {/* [NEEDS INPUT: actual Telegram handle/link] */}
                    <p className="font-semibold text-stone-800 dark:text-stone-200">
                      <a href={BUSINESS_INFO.social.telegram.link} target="_blank" rel="noopener noreferrer" className="hover:text-lux-gold transition-colors underline">
                        {BUSINESS_INFO.social.telegram.handle}
                      </a>
                    </p>
                    <span className="text-[11px] text-stone-400 dark:text-stone-500">{t('contact.quickestChannel')}</span>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <Mail className="w-5 h-5 text-lux-gold shrink-0 mt-0.5" />
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-widest text-stone-400 dark:text-stone-500 font-semibold block mb-0.5">{t('contact.inquiriesMailbox')}</label>
                    {/* [NEEDS INPUT: actual professional email] */}
                    <p className="font-mono dark:text-stone-300">{BUSINESS_INFO.email}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <Phone className="w-5 h-5 text-lux-gold shrink-0 mt-0.5" />
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-widest text-stone-400 dark:text-stone-500 font-semibold block mb-0.5">{t('contact.directVoice')}</label>
                    {/* [NEEDS INPUT: actual phone number] */}
                    <p className="font-mono text-stone-800 dark:text-stone-150 font-semibold">{BUSINESS_INFO.phone}</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 font-light">{t('contact.workingHours')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Studio Hours & Pickup Info */}
            <div className="bg-stone-900 text-white p-8 rounded-sm shadow-xl space-y-4 border border-stone-800 font-sans">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-lux-gold" />
                <h3 className="font-serif text-lg text-white">{t('contact.studioLocation')}</h3>
              </div>
              <p className="text-xs text-stone-400 font-light leading-relaxed font-sans">
                {t('contact.operatingInfo')}
              </p>
              <div className="p-4 bg-stone-850 rounded-xs border border-stone-800 space-y-2 text-xs font-sans">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-stone-400 text-[10px] uppercase">{t('contact.topic')}</span>
                  <span className="font-mono text-lux-gold font-semibold">{BUSINESS_INFO.location.name.toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center border-t border-stone-800 pt-2">
                  <span className="font-mono text-stone-400 text-[10px] uppercase">Pickup Hours</span>
                  <span className="text-xs font-mono text-stone-200">{BUSINESS_INFO.hours.pickup}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive general Contact Form Column */}
          <div className="lg:col-span-7 bg-white dark:bg-stone-950 p-8 sm:p-10 border border-stone-200/60 dark:border-stone-850 rounded-sm shadow-xs text-left">
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
                    {t('contact.messageReceivedDesc')}
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
                    <span className="text-[10px] uppercase tracking-widest text-lux-gold font-mono block font-semibold">{t('contact.directMessageLink')}</span>
                      <h2 className="font-serif text-2xl text-stone-900 dark:text-stone-100">{t('contact.sendStudioNote')}</h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-light font-sans">{t('contact.generalQuestions')}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-450 font-bold block mb-1">{t('contact.nameLabel')}</label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder={t('contact.namePlaceholder')}
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
                        placeholder={t('contact.emailPlaceholder')}
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
                      <option value="Consultation">{t('contact.customDesignReview')}</option>
                      <option value="Dietary">{t('contact.dietRequirements')}</option>
                      <option value="Other">{t('contact.generalQuestionsOpt')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-450 font-bold block mb-1">{t('contact.messageBody')}</label>
                    <textarea
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      rows={4}
                      placeholder={t('contact.messagePlaceholder')}
                      className="w-full border border-stone-200 dark:border-stone-800 p-3 text-sm focus:outline-none focus:border-lux-gold bg-stone-50/50 dark:bg-stone-900/60 rounded-sm text-stone-850 dark:text-stone-100 placeholder-stone-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-4 bg-stone-900 dark:bg-stone-800 hover:bg-stone-850 dark:hover:bg-stone-700 text-white font-medium text-xs tracking-[0.25em] uppercase rounded-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? <Loader2 className="w-4 h-4 text-lux-gold animate-spin" /> : <Send className="w-4 h-4 text-lux-gold" />}
                    {sending ? t('contact.sending') : t('contact.send')}
                  </button>
                </form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Google Maps Studio Location Embed Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-stone-900 text-white p-8 sm:p-12 rounded-sm border border-stone-800 relative z-10 overflow-hidden font-sans">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left detail column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-lux-gold/20 bg-lux-gold/5 font-sans">
                <MapPin className="w-3.5 h-3.5 text-lux-gold" />
                <span className="text-[9px] uppercase tracking-[0.25em] text-lux-gold font-mono font-semibold">Studio Location & Atelier</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif text-white">{BUSINESS_INFO.location.name}</h2>
              <p className="text-sm text-stone-300 font-light leading-relaxed font-sans">
                {BUSINESS_INFO.location.directionsNote}
              </p>
              
              <div className="space-y-3 pt-2 text-xs font-light text-stone-300 font-sans">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-lux-gold shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white font-medium">Address:</strong> {BUSINESS_INFO.location.fullAddress}
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-lux-gold shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white font-medium">Coordinates:</strong> {BUSINESS_INFO.location.coordinates.display}
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-lux-gold shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white font-medium">Pickup Hours:</strong> {BUSINESS_INFO.hours.pickup}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={BUSINESS_INFO.location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-sm bg-lux-gold text-stone-950 font-semibold text-xs tracking-widest uppercase hover:bg-lux-gold-light transition-all shadow-md group cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            </div>

            {/* Embedded Google Maps Frame with Luxury Dark Styling */}
            <div className="lg:col-span-7">
              <div className="relative rounded-sm overflow-hidden border border-stone-800 bg-stone-950 shadow-2xl">
                {/* Header bar */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-stone-950 border-b border-stone-800 text-[11px] font-mono text-stone-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-stone-200 font-medium">{BUSINESS_INFO.location.area}, {BUSINESS_INFO.location.city}</span>
                  </div>
                  <span className="text-stone-500 hidden sm:inline">{BUSINESS_INFO.location.coordinates.display}</span>
                </div>

                {/* Google Maps iFrame */}
                <div className="relative w-full h-[380px] sm:h-[440px] bg-stone-950">
                  <iframe
                    title="Flavour Bites Studio Location — Garment, Addis Ababa"
                    src={BUSINESS_INFO.location.googleMapsEmbedUrl}
                    className="w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  
                  {/* Floating studio badge overlay */}
                  <div className="absolute bottom-4 left-4 pointer-events-none">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xs bg-stone-950/90 backdrop-blur-md border border-stone-800 shadow-lg text-[11px] font-mono text-stone-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-lux-gold" />
                      <span>{BUSINESS_INFO.name} Atelier</span>
                      <span className="text-stone-500">•</span>
                      <span className="text-lux-gold">{BUSINESS_INFO.location.area}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Banner Link */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-stone-50 dark:bg-stone-900/40 border border-stone-200/60 dark:border-stone-850 rounded-sm p-8 text-center shadow-xs">
          <h3 className="font-serif text-xl text-stone-900 dark:text-stone-100 mb-2">Have specific questions?</h3>
          <p className="text-stone-500 dark:text-stone-400 font-light text-sm mb-6 max-w-md mx-auto">
            Check our Support & Guide page for detailed instructions on ordering, tracking, and our frequently asked questions.
          </p>
          <a href="/help" className="inline-flex items-center justify-center px-6 py-2.5 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 font-medium text-xs tracking-widest uppercase rounded-sm hover:border-lux-gold dark:hover:border-lux-gold transition-colors font-semibold">
            Visit the Help Guide
          </a>
        </div>
      </section>
    </div>
  );
}
