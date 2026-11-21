import { Trash2, X } from 'lucide-react';
import { t } from '@client/i18n/index';

interface ChatHeaderProps {
  onClear: () => void;
  onClose: () => void;
}

export default function ChatHeader({ onClear, onClose }: ChatHeaderProps) {
  return (
    <div className="bg-stone-900 text-white p-4 flex items-center justify-between border-b border-lux-gold/25 relative">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-stone-900 border border-lux-gold/30 flex items-center justify-center text-lux-gold">
          <img src="/favicon_pink_f_1782078000588.jpg" alt="Flavour Bites" className="w-full h-full rounded-full object-cover" />
        </div>
        <div>
          <h3 className="font-serif text-sm tracking-wider text-white font-medium flex items-center gap-1.5">
            {t('bot.title')}
            <span className="px-1.5 py-0.5 bg-lux-gold/15 text-lux-gold text-[8px] uppercase tracking-widest font-mono font-bold rounded-xs border border-lux-gold/20">
              {t('bot.live')}
            </span>
          </h3>
          <span className="text-[9px] uppercase tracking-wider text-stone-400 font-mono font-semibold block">{t('bot.subtitle')}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onClear}
          title="Clear chat log"
          className="p-1 px-1.5 rounded-xs hover:bg-stone-850/60 text-stone-400 hover:text-red-400 transition-colors cursor-pointer"
          aria-label={t('bot.clearLog')}
        >
          <Trash2 className="w-4 h-4 shrink-0" />
        </button>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-stone-850/80 text-stone-400 hover:text-white transition-colors cursor-pointer"
          aria-label={t('bot.closePanel')}
        >
          <X className="w-4 h-4 shrink-0" />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-lux-gold/70 to-transparent" />
    </div>
  );
}