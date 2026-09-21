import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';
import { t } from '@client/i18n/index';
import { useContactForm, ContactFormState } from '../hooks/useContactForm';

interface ContactFormSectionProps {
  form: ReturnType<typeof useContactForm>;
}

function ContactSuccess({ onReset }: { onReset: () => void }) {
  return (
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
        onClick={onReset}
        className="px-6 py-2 bg-stone-900 dark:bg-stone-800 text-white font-medium text-xs tracking-widest uppercase rounded-sm hover:bg-stone-800 dark:hover:bg-stone-701 font-semibold"
      >
        {t('contact.sendAnother')}
      </button>
    </motion.div>
  );
}

function ContactFormFields({
  form,
  sending,
  onFieldChange,
}: {
  form: ContactFormState;
  sending: boolean;
  onFieldChange: (field: keyof ContactFormState, value: string) => void;
}) {
  return (
    <>
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
            value={form.name}
            onChange={(e) => onFieldChange('name', e.target.value)}
            placeholder={t('contact.namePlaceholder')}
            className="w-full border border-stone-200 dark:border-stone-800 p-3 text-sm focus:outline-none focus:border-lux-gold bg-stone-50/50 dark:bg-stone-900/60 rounded-sm text-stone-850 dark:text-stone-100 placeholder-stone-400"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-450 font-bold block mb-1">{t('contact.emailLabel')}</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => onFieldChange('email', e.target.value)}
            placeholder={t('contact.emailPlaceholder')}
            className="w-full border border-stone-200 dark:border-stone-800 p-3 text-sm focus:outline-none focus:border-lux-gold bg-stone-50/50 dark:bg-stone-900/60 rounded-sm text-stone-850 dark:text-stone-100 placeholder-stone-400"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] uppercase font-mono tracking-widest text-stone-500 dark:text-stone-450 font-bold block mb-1">{t('contact.subject')}</label>
        <select
          value={form.subject}
          onChange={(e) => onFieldChange('subject', e.target.value)}
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
          value={form.message}
          onChange={(e) => onFieldChange('message', e.target.value)}
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
        {sending ? (
          <Loader2 className="w-4 h-4 text-lux-gold animate-spin" />
        ) : (
          <Send className="w-4 h-4 text-lux-gold" />
        )}
        {sending ? t('contact.sending') : t('contact.send')}
      </button>
    </>
  );
}

export default function ContactFormSection({ form }: ContactFormSectionProps) {
  return (
    <div className="lg:col-span-7 bg-white dark:bg-stone-950 p-8 sm:p-10 border border-stone-200/60 dark:border-stone-850 rounded-sm shadow-xs text-left">
      <AnimatePresence mode="wait">
        {form.formSubmitted ? (
          <ContactSuccess onReset={form.resetSubmitted} />
        ) : (
          <form onSubmit={form.handleContactSubmit} className="space-y-6 font-sans" id="contact-general-form">
            {form.valError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-450 text-xs rounded-sm font-sans flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                <span>{form.valError}</span>
              </div>
            )}
            <ContactFormFields form={form.contactForm} sending={form.sending} onFieldChange={form.handleFieldChange} />
          </form>
        )}
      </AnimatePresence>
    </div>
  );
}