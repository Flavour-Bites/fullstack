import React, { useState, useEffect, useRef } from 'react';
import { Shield, Key, LogIn, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from './Toast';
import { User as UserType } from '../types';
import { t } from '../i18n';
import { setToken } from '../shared/utils/apiClient';
import { usePageTitle } from '../hooks/usePageTitle';

interface AuthViewProps {
  onAuthSuccess: (user: UserType) => void;
  defaultMode?: 'login' | 'register';
  title?: string;
  subtitle?: string;
}

function TelegramLoginButton({ onSuccess }: { onSuccess: (data: any) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (window as any).onTelegramAuth = (data: any) => {
      onSuccess(data);
    };

    if (containerRef.current && containerRef.current.children.length === 0) {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      const botUsername = (import.meta as any).env.VITE_TELEGRAM_BOT_USERNAME || 'flavour_bites_bot';
      script.setAttribute('data-telegram-login', botUsername);
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');
      script.async = true;
      containerRef.current.appendChild(script);
    }

    return () => {
      delete (window as any).onTelegramAuth;
      // Do not clear innerHTML here, it breaks the iframe in StrictMode
    };
  }, []);

  return <div ref={containerRef} className="flex justify-center" />;
}

export default function AuthView({
  onAuthSuccess,
  title,
  subtitle
}: AuthViewProps) {
  usePageTitle("Sign In");
  const { showToast } = useToast();
  const [step, setStep] = useState<'telegram' | 'password'>('telegram');
  const [telegramId, setTelegramId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTelegramSuccess = async (telegramData: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telegramData),
      });
      const result = await res.json();
      if (result.success) {
        if (result.needsPassword) {
          setTelegramId(result.telegramId);
          setStep('password');
          return;
        }
        setToken(result.token);
        localStorage.setItem('flavourbites_user', JSON.stringify(result.user));
        showToast(t('auth.welcome'), `Hello, ${result.user.name}.`, 'success');
        onAuthSuccess(result.user);
      } else {
        throw new Error(result.error || 'Sign in failed.');
      }
    } catch (err: any) {
      showToast(t('auth.signInFailed'), err.message || t('auth.checkDetails'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
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
        showToast(t('auth.welcomeBack'), `Hello, ${data.user.name}.`, 'success');
        onAuthSuccess(data.user);
      } else {
        throw new Error(data.error || 'Sign in failed.');
      }
    } catch (err: any) {
      showToast(t('auth.signInFailed'), err.message || t('auth.checkDetails'), 'error');
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-stone-900 hover:bg-lux-gold text-white hover:text-stone-950 font-bold text-xs tracking-widest uppercase transition-all duration-300 rounded-sm flex items-center justify-center gap-2 cursor-pointer border border-stone-800"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? t('auth.pleaseWait') : t('auth.signIn')}
            </button>
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
          <TelegramLoginButton onSuccess={handleTelegramSuccess} />
        </div>
      </div>
    </div>
  );
}
