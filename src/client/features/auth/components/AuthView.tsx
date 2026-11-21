import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Info } from 'lucide-react';
import { useToast } from '../../../components/Toast';
import { User as UserType } from '@shared/types';
import { t } from '@client/i18n/index';
import { http } from '@client/lib/http';
import type { ApiResponse } from '@/shared/api';
import { usePageTitle } from '@client/lib/usePageTitle';

interface AuthViewProps {
  onAuthSuccess: (user: UserType) => void;
  title?: string;
  subtitle?: string;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onAuthSuccess: _onAuthSuccess,
  title,
  subtitle,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  usePageTitle(title ?? t('auth.signInTitle'));

  const handleTelegramOidcLogin = async () => {
    setLoading(true);
    try {
      const { data } = await http.get<ApiResponse<{ authorizationUrl?: string }>>('/api/auth/telegram/login', {
        headers: { Accept: 'application/json' },
      });
      if (data.success && data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        const errorMsg = data.error || 'Failed to initialize Telegram login';
        showToast(t('common.error'), errorMsg, 'error');
        setLoading(false);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to connect to authentication server';
      showToast(t('common.error'), errorMsg, 'error');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-6 font-sans">
      <div className="bg-white/95 dark:bg-stone-950/90 border border-stone-200/80 dark:border-stone-850 rounded-md p-8 relative shadow-sm">
        <div className="text-center space-y-2 mb-6">
          <img src="/favicon_pink_f_1782078000588.jpg" alt="Flavour Bites" className="w-14 h-14 rounded-full object-cover mx-auto mb-3" />
          <h2 className="text-2xl font-serif text-stone-900 dark:text-white font-bold tracking-tight">
            {title || t('auth.signInTitle')}
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto leading-relaxed">
            {subtitle || t('auth.signInSubtitle')}
          </p>
        </div>

        {/* Clean, brand-harmonious value points */}
        <div className="my-6 space-y-3 text-left">
          <div className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lux-gold shrink-0" />
              <span>{t('auth.telegramBenefit1')}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lux-gold shrink-0" />
              <span>{t('auth.telegramBenefit2')}</span>
            </div>
          </div>

          {/* Gentle, pale gold accent note */}
          <div className="p-3 rounded-sm bg-lux-gold/5 dark:bg-lux-gold/10 border border-lux-gold/20 flex items-start gap-2.5 text-stone-700 dark:text-stone-300">
            <Info className="w-3.5 h-3.5 text-lux-gold shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              {t('auth.telegramPromptTip')}
            </p>
          </div>
        </div>

        {/* Telegram button matching dark primary button ("Book Custom Cake") */}
        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleTelegramOidcLogin}
            disabled={loading}
            className="w-full py-3 bg-stone-900 hover:bg-lux-gold text-white hover:text-stone-950 font-bold text-xs tracking-wider uppercase transition-all duration-300 rounded-sm flex items-center justify-center gap-2.5 cursor-pointer border border-stone-800 hover:border-lux-gold shadow-xs group disabled:opacity-60"
          >
            <svg className="w-4 h-4 fill-white group-hover:fill-stone-950 transition-colors shrink-0" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.568 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.119.098.152.228.166.324.015.1.032.327.017.507z"/>
            </svg>
            <span>{t('auth.continueWithTelegram')}</span>
          </motion.button>
        </div>

        <p className="mt-4 text-[10px] text-stone-400 dark:text-stone-500 font-mono tracking-wide text-center">
          {t('auth.telegramNoSpam')}
        </p>

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/90 dark:bg-stone-950/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-md"
            >
              <div className="w-12 h-12 bg-stone-900 border border-stone-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Loader2 className="w-6 h-6 text-lux-gold animate-spin" />
              </div>
              <p className="text-sm font-serif text-stone-900 dark:text-stone-100">{t('auth.signingIn')}</p>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">{t('auth.verifyingTelegram')}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
