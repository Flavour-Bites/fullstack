import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { t } from '../../../i18n/index';

interface RequestSuccessViewProps {
  submittedId: string;
  onReset: () => void;
}

export default function RequestSuccessView({ submittedId, onReset }: Readonly<RequestSuccessViewProps>) {
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
      <div className="p-4 bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 rounded-sm text-left max-w-md mx-auto">
        <p className="font-semibold mb-1">{t('order.whatHappensNext')}</p>
        <ol className="list-decimal pl-4 space-y-1">
          <li>Yodit reviews your request and checks availability.</li>
          <li>She reaches out by phone or Telegram to discuss flavours, design, and pricing.</li>
          <li>Once confirmed, your cake enters production and you can track it below.</li>
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
