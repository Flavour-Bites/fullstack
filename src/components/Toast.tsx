import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle, AlertOctagon, Info, AlertTriangle, X } from 'lucide-react';
import { t } from '../i18n';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'majestic';

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (title: string, description: string, type?: ToastType, duration?: number) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((title: string, description: string, type: ToastType = 'success', duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, description, type, duration }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-[#191613]/98 text-white',
          border: 'border-l-4 border-l-emerald-500 border-stone-800',
          glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
          icon: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
          accent: 'text-emerald-400'
        };
      case 'error':
        return {
          bg: 'bg-[#1e1414]/98 text-white',
          border: 'border-l-4 border-l-rose-500 border-stone-800',
          glow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]',
          icon: <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />,
          accent: 'text-rose-400'
        };
      case 'warning':
        return {
          bg: 'bg-[#1a1712]/98 text-white',
          border: 'border-l-4 border-l-amber-500 border-stone-800',
          glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          accent: 'text-amber-400'
        };
      case 'info':
        return {
          bg: 'bg-[#12161b]/98 text-white',
          border: 'border-l-4 border-l-blue-400 border-stone-800',
          glow: 'shadow-[0_0_15px_rgba(96,165,250,0.15)]',
          icon: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
          accent: 'text-blue-400'
        };
      case 'majestic':
      default:
        // Elegant gold luxury notification theme
        return {
          bg: 'bg-stone-950/98 text-white',
          border: 'border border-lux-gold/60 border-l-[6px] border-l-lux-gold',
          glow: 'shadow-[0_0_20px_rgba(212,175,55,0.25)]',
          icon: <Sparkles className="w-5 h-5 text-lux-gold shrink-0 animate-pulse" />,
          accent: 'text-lux-gold'
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      
      {/* Toast Notification HUD Overlay */}
      <div className="fixed top-20 right-4 sm:right-6 z-[9999] pointer-events-none max-w-sm w-full space-y-3 font-sans">
        <AnimatePresence>
          {toasts.map((toast) => {
            const styles = getToastStyles(toast.type);
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.93 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 240 }}
                role="alert"
                aria-live="polite"
                className={`pointer-events-auto w-full p-4.5 rounded-sm flex items-start gap-3.5 border ${styles.bg} ${styles.border} ${styles.glow} backdrop-blur-md relative`}
              >
                {/* Visual Glow Node */}
                <span className="absolute top-0 right-0 w-8 h-8 pointer-events-none bg-radial from-lux-gold/10 to-transparent opacity-50" />

                {/* Left side category/status Icon */}
                <div className="mt-0.5">{styles.icon}</div>

                {/* Headline Message Body */}
                <div className="flex-grow text-left space-y-0.5">
                  <h4 className={`text-xs font-serif font-semibold tracking-wide flex items-center gap-1.5 ${styles.accent}`}>
                    {toast.title}
                    {toast.type === 'majestic' && (
                      <span className="text-[7.5px] uppercase tracking-widest font-mono bg-lux-gold/15 px-1.5 text-lux-gold py-0.5 rounded-sm font-black border border-lux-gold/20">
                        {t('toast.atelierExquisite')}
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-stone-300 font-light leading-normal font-sans">
                    {toast.description}
                  </p>
                </div>

                {/* Inline Manual Dismiss controller */}
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="text-stone-400 hover:text-white transition-colors cursor-pointer mt-0.5 shrink-0 hover:bg-stone-850 p-1 rounded-sm"
                  aria-label={t('toast.dismissNotification')}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
