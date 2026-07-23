import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, LogOut, CheckCircle, Smartphone, Info } from 'lucide-react';
import { t } from '../i18n';
import { usePageTitle } from '../hooks/usePageTitle';

interface ProfileViewProps {
  currentUser: any;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

export default function ProfileView({ currentUser, onLogout, onNavigate }: ProfileViewProps) {
  usePageTitle("Profile");
  const [telegramId, setTelegramId] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState(false);

  const handleConnectTelegram = (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    
    setTimeout(() => {
      setConnecting(false);
      setConnectionSuccess(true);
      setTelegramId('');
      
      setTimeout(() => setConnectionSuccess(false), 3000);
    }, 1000);
  };

  if (!currentUser) {
    return (
      <div className="bg-lux-cream/30 dark:bg-stone-900/10 min-h-screen py-16 px-4 flex justify-center items-center font-sans">
        <p className="text-stone-500 font-light">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="bg-lux-cream/30 dark:bg-stone-900/10 min-h-screen py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Visual Title Header */}
        <div className="text-center">
          <span className="text-[10px] uppercase tracking-[0.3em] text-lux-gold font-mono block mb-2 font-bold">{t('profile.accountDashboard')}</span>
          <h1 className="text-4xl font-serif text-warm-950 dark:text-stone-100 font-medium italic">{t('profile.yourProfile')}</h1>
          <div className="h-[2px] w-12 bg-lux-gold mx-auto mt-4" />
        </div>

        {/* Top Section: Quick Account Overview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Identity Card */}
          <div className="md:col-span-5 bg-white dark:bg-[#111111] p-6 border border-stone-200/60 dark:border-stone-850 rounded-xs shadow-xs text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <User className="w-32 h-32 text-stone-900 dark:text-white" />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div>
                <h2 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100">{currentUser.name}</h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-mono mt-1">{currentUser.email}</p>
                
                <span className="inline-block mt-3 px-2 py-0.5 bg-lux-gold/10 border border-lux-gold/20 text-lux-gold text-[10px] uppercase font-mono font-bold tracking-wider rounded-xs">
                  {currentUser.role} {t('profile.accessLevel')}
                </span>
              </div>

              <div className="space-y-3 pt-4 border-t border-stone-100 dark:border-stone-850">
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-red-600 dark:text-red-400 hover:text-red-700 font-semibold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {t('profile.signOut')}
                </button>
              </div>
            </div>
          </div>

          {/* Telegram Migration Card */}
          <div className="md:col-span-7 bg-white dark:bg-[#111111] p-6 border border-stone-200/60 dark:border-stone-850 rounded-xs shadow-xs text-left">
            <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100 font-medium mb-1">{t('profile.migrateTelegram')}</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-light font-sans mb-5 max-w-md leading-relaxed">
              {t('profile.migrationDescription')}
            </p>

            <form onSubmit={handleConnectTelegram} className="flex gap-2 max-w-md font-sans">
              <div className="relative flex-grow">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder={t('profile.telegramIdPlaceholder')}
                  required
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-1 focus:ring-lux-gold focus:border-lux-gold pl-9 pr-3 py-3 text-xs text-stone-850 dark:text-stone-100 placeholder-stone-400 rounded-sm"
                />
              </div>
              <button
                type="submit"
                disabled={connecting}
                className="px-4 py-3 bg-stone-900 dark:bg-stone-800 hover:bg-lux-gold text-white hover:text-stone-950 dark:hover:text-stone-950 font-mono text-[10px] uppercase font-bold tracking-wider rounded-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
              >
                {connecting ? t('profile.connecting') : t('profile.connectId')}
              </button>
            </form>

            {connectionSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 text-[11px] rounded-xs font-sans flex items-center gap-2 max-w-md"
              >
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                <span>{t('profile.migrationSuccess')}</span>
              </motion.div>
            )}

            <div className="mt-5 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-400 text-[11px] rounded-xs font-sans flex items-start gap-2 max-w-md">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="font-light leading-relaxed">
                {t('profile.migrationNote')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
