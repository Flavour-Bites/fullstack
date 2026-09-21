import { Lock } from 'lucide-react';
import { User as UserType } from '@shared/types';
import ProfileTabPanel from './ProfileTabPanel';

function TelegramConnectedCard({ currentUser }: { currentUser: UserType }) {
  return (
    <div className="p-5 bg-stone-50/50 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs relative overflow-hidden group">
      <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-blue-500 rounded-l-sm" />

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center shrink-0 border border-blue-500/10 group-hover:scale-105 transition-transform duration-300">
          <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.5 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
        </div>
        <div>
          <div className="text-sm font-semibold text-stone-900 dark:text-stone-100">Telegram Account</div>
          <div className="text-xs text-stone-400 dark:text-stone-500 mt-1 font-mono">
            Connected as {currentUser.telegramUsername ? `@${currentUser.telegramUsername}` : `ID: ${currentUser.telegramId}`}
          </div>
        </div>
      </div>
      <div className="self-start sm:self-auto flex items-center">
        <div className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] uppercase tracking-wider font-mono font-bold rounded-full border border-green-500/20">
          Connected
        </div>
      </div>
    </div>
  );
}

function OidcNotice() {
  return (
    <div className="p-5 bg-lux-cream/40 dark:bg-stone-900/10 border border-lux-gold/15 dark:border-lux-gold/10 rounded-sm text-xs text-stone-600 dark:text-stone-400 space-y-2">
      <div className="flex items-center gap-2 text-lux-gold font-semibold font-mono uppercase tracking-wider text-[10px]">
        <Lock className="w-3.5 h-3.5" />
        <span>Secure OIDC Authentication</span>
      </div>
      <p className="font-light leading-relaxed">
        Your account is secured via Telegram OpenID Connect (OIDC). We never store passwords directly, ensuring your account is immune to typical credential leaks.
      </p>
    </div>
  );
}

export default function SecurityTab({ currentUser }: { currentUser: UserType }) {
  return (
    <ProfileTabPanel
      title="Security"
      subtitle="Manage credentials & secure connection statuses"
    >
      <TelegramConnectedCard currentUser={currentUser} />
      <OidcNotice />
    </ProfileTabPanel>
  );
}