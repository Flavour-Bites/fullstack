import { ShieldAlert } from 'lucide-react';
import { t } from '@client/i18n/index';

export default function ChatErrorBanner({ errorStatus }: { errorStatus: string | null }) {
  if (!errorStatus) return null;

  return (
    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs font-sans flex items-start gap-2.5">
      <ShieldAlert className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
      <div>
        <span className="font-semibold block text-red-955 mb-0.5">{t('bot.connectionBlocked')}</span>
        <p className="text-[11px] leading-relaxed text-red-600">{errorStatus}</p>
      </div>
    </div>
  );
}