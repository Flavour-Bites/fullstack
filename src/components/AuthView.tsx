import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Key, LogIn, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from './Toast';
import { User as UserType } from '../types';
import { t } from '../i18n';
import { setToken } from '../shared/utils/apiClient';
import { usePageTitle } from '../hooks/usePageTitle';

interface AuthViewProps {
  onAuthSuccess: (user: UserType) => void;
  title?: string;
  subtitle?: string;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onAuthSuccess,
  title,
  subtitle,
}) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [telegramId] = useState<string>('');
  const [step, setStep] = useState<'telegram' | 'password'>('telegram');

  usePageTitle(title ?? t('auth.signInTitle'));


  const handleTelegramOidcLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/telegram/login', {
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      if (data.success && data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        window.location.href = '/api/auth/telegram/login';
      }
    } catch {
      window.location.href = '/api/auth/telegram/login';
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password) {
      showToast(t('auth.formIncomplete'), t('auth.enterPassword'), 'warning');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/telegram/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId, password }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        localStorage.setItem('flavourbites_user', JSON.stringify(data.user));
        showToast(t('auth.welcomeBack'), `Hello, ${data.user.name}. Welcome back.`, 'success');
        onAuthSuccess(data.user);
      } else {
        throw new Error(data.error || 'Sign in failed.');
      }
    } catch (err: any) {
      showToast(t('auth.signInFailed'), err.message || t('auth.checkDetails') + ' Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'password') {
    return (
      <div className="max-w-md mx-auto py-12 px-4 sm:px-6 font-sans">
        <div className="bg-white dark:bg-[#111111] border border-stone-200 dark:border-stone-800 shadow-xl rounded-md p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-stone-900 via-lux-gold to-stone-900" />

          <div className="text-center space-y-2 mb-8">
            <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center text-lux-gold mx-auto shadow-md">
              <Key className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h2 className="text-2xl font-serif text-stone-900 dark:text-white font-bold tracking-tight">
              {t('auth.enterPasswordTitle')}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
              {t('auth.enterPasswordSubtitle')}
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-450 font-bold block">{t('auth.password')}</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="password"
                  placeholder={t('auth.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-stone-850 dark:text-stone-100 text-xs py-2.5 pl-9 pr-3 rounded-sm focus:outline-none focus:ring-1 focus:ring-lux-gold focus:bg-white focus:dark:bg-stone-900 transition-all"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full py-2.5 bg-stone-900 hover:bg-lux-gold text-white hover:text-stone-950 font-bold text-xs tracking-widest uppercase transition-all duration-300 rounded-sm flex items-center justify-center gap-2 cursor-pointer border border-stone-800 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? t('auth.pleaseWait') : t('auth.signIn')}
            </motion.button>
          </form>

          <button
            onClick={() => { setStep('telegram'); setPassword(''); }}
            className="mt-4 text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 flex items-center justify-center gap-1 w-full transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            {t('auth.tryDifferentAccount')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-6 font-sans">
      <div className="bg-white dark:bg-[#111111] border border-stone-200 dark:border-stone-800 shadow-xl rounded-md p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-stone-900 via-lux-gold to-stone-900" />

        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center text-lux-gold mx-auto shadow-md">
            <Shield className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h2 className="text-2xl font-serif text-stone-900 dark:text-white font-bold tracking-tight">
            {title || t('auth.signInTitle')}
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
            {subtitle || t('auth.signInSubtitle')}
          </p>
        </div>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleTelegramOidcLogin}
            disabled={loading}
            className="w-full py-3 bg-[#229ED9] hover:bg-[#1e8dbf] text-white font-bold text-xs tracking-wider uppercase transition-all duration-300 rounded-sm flex items-center justify-center gap-2.5 shadow-md cursor-pointer disabled:opacity-60"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.568 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.119.098.152.228.166.324.015.1.032.327.017.507z"/>
            </svg>
            Continue with Telegram
          </motion.button>
        </div>

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/90 dark:bg-[#111111]/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-md"
            >
              <div className="w-14 h-14 bg-stone-900 rounded-full flex items-center justify-center mb-4 shadow-lg">
                <Loader2 className="w-7 h-7 text-lux-gold animate-spin" />
              </div>
              <p className="text-sm font-serif text-stone-900 dark:text-stone-100">Signing you in...</p>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">Verifying with Telegram</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
