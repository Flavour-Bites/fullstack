import { Send } from 'lucide-react';
import { t } from '@client/i18n/index';

interface ChatInputProps {
  value: string;
  loading: boolean;
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  onChange: (value: string) => void;
}

export default function ChatInput({ value, loading, onSubmit, onChange }: ChatInputProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="p-3 bg-white border-t border-stone-200 flex gap-2 items-center"
      id="assistant-chat-form"
    >
      <input
        type="text"
        disabled={loading}
        placeholder={t('bot.inputPlaceholder')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-grow bg-stone-50 border border-stone-205 focus:outline-none focus:ring-1 focus:ring-lux-gold focus:border-lux-gold px-3 py-2.5 text-xs text-stone-800 placeholder-stone-400 rounded-sm transition-all disabled:opacity-60 font-sans"
      />
      <button
        type="submit"
        disabled={!value.trim() || loading}
        className="w-9 h-9 bg-stone-900 border border-stone-850 hover:bg-lux-gold text-white hover:text-stone-950 flex items-center justify-center shrink-0 rounded-sm transition-all disabled:opacity-40 disabled:hover:bg-stone-900 disabled:hover:text-white cursor-pointer"
        aria-label={t('bot.sendQuery')}
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}