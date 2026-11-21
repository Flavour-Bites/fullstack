import { Bot } from 'lucide-react';
import { t } from '@client/i18n/index';

export default function TypingLoader() {
  return (
    <div className="flex gap-2.5 max-w-[85%] mr-auto items-start animate-pulse">
      <div className="w-6.5 h-6.5 rounded-full flex items-center justify-center shrink-0 bg-stone-900 border border-lux-gold/30 text-lux-gold">
        <Bot className="w-3 h-3" />
      </div>
      <div className="space-y-1">
        <div className="bg-white border border-stone-150 p-3.5 rounded-sm rounded-tl-none text-stone-500 flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-lux-gold animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-lux-gold animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-lux-gold animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-[10px] font-mono tracking-wider text-stone-400 uppercase font-semibold">{t('bot.consulting')}</span>
        </div>
      </div>
    </div>
  );
}