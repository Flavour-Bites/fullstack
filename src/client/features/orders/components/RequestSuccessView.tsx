import { motion } from 'motion/react';
import { CheckCircle2, Send } from 'lucide-react';
import { t } from '@client/i18n/index';
import { BUSINESS_INFO } from '@shared/constants/business';

interface RequestSuccessViewProps {
  submittedId: string;
  onReset: () => void;
}

export default function RequestSuccessView({ submittedId, onReset }: Readonly<RequestSuccessViewProps>) {
  const telegramUrl = `${BUSINESS_INFO.social.telegram.link}?start=order_${submittedId}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="text-center py-16 space-y-6"
    >
      <div className="w-20 h-20 bg-green-50 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto border border-green-200 dark:border-green-900">
        <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
      </div>
      <h3 className="text-2xl font-serif text-stone-900 dark:text-stone-100">{t('order.thankYou')}</h3>
      <p className="text-sm text-stone-600 dark:text-stone-300 max-w-lg mx-auto font-sans font-light leading-relaxed">
        Your request <span className="font-mono text-lux-gold font-semibold">{submittedId}</span> has been received. Yodit will review it and reach out within 24 hours to discuss your cake.
      </p>

      {/* Telegram Real-time Tracking Handoff */}
      <div className="p-5 bg-gradient-to-r from-lux-gold/10 via-amber-500/10 to-transparent border border-lux-gold/30 rounded-md text-left max-w-md mx-auto space-y-3">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-lux-gold" />
          <span className="font-mono text-xs uppercase font-bold tracking-wider text-stone-900 dark:text-stone-100">
            Real-Time Telegram Tracking
          </span>
        </div>
        <p className="text-xs text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
          Track your order and get notified instantly on Telegram the moment Yodit reviews your design and quotes your price.
        </p>
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#229ED9] hover:bg-[#1E88E5] text-white font-mono text-xs uppercase tracking-wider font-bold rounded-sm transition-colors shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          Track on Telegram & Receive Alerts
        </a>
      </div>

      <div className="p-4 bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 rounded-sm text-left max-w-md mx-auto">
        <p className="font-semibold mb-1">{t('order.whatHappensNext')}</p>
        <ol className="list-decimal pl-4 space-y-1">
          <li>Yodit reviews your request and checks availability.</li>
          <li>She quotes a custom price for your design.</li>
          <li>Once price is accepted and deposit confirmed, your cake is scheduled for baking!</li>
        </ol>
      </div>

      <button
        onClick={onReset}
        className="px-6 py-2.5 bg-stone-900 dark:bg-stone-800 hover:bg-lux-gold hover:text-stone-950 text-white font-medium text-xs tracking-widest uppercase rounded-sm transition-all cursor-pointer"
      >
        {t('order.createAnother')}
      </button>
    </motion.div>
  );
}
