import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Sun, Moon, LogOut, LogIn, CalendarDays, ChevronRight, User as UserIcon, ArrowRight } from 'lucide-react';
import type { Locale } from '@client/i18n/index';
import type { User } from '@shared/types';

interface HeaderMobileMenuProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  currentUser: User | null;
  darkMode: boolean;
  locale: Locale;
  onToggleLocale: () => void;
  onToggleDarkMode: () => void;
  onSearchOpen: () => void;
  onLogout: () => void;
}

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Cake Gallery', path: '/gallery' },
  { label: 'Testimonials', path: '/testimonials' },
  { label: 'Meet Yodit', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

const ROLE_LABELS: Record<string, string> = {
  admin: 'System Admin',
  staff: 'Bakery Staff',
  customer: 'Customer',
};

export default function HeaderMobileMenu({
  mobileMenuOpen,
  setMobileMenuOpen,
  currentUser,
  darkMode,
  locale,
  onToggleLocale,
  onToggleDarkMode,
  onLogout,
}: Readonly<HeaderMobileMenuProps>) {
  const location = useLocation();

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className={`lg:hidden border-b overflow-hidden font-sans shadow-2xl backdrop-blur-2xl ${
            darkMode
              ? 'bg-stone-950/98 border-stone-850 text-stone-100'
              : 'bg-lux-cream/98 border-stone-200/80 text-stone-900'
          }`}
        >
          <div className="max-w-xl mx-auto px-5 py-6 space-y-4">
            {/* Navigation Links */}
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? darkMode
                          ? 'bg-lux-gold/15 text-lux-gold font-bold border border-lux-gold/30 shadow-xs'
                          : 'bg-lux-gold/15 text-stone-900 font-bold border border-lux-gold/30 shadow-xs'
                        : darkMode
                          ? 'text-stone-300 hover:text-white hover:bg-stone-900/60'
                          : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/50'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-lux-gold animate-pulse" />}
                      <span>{item.label}</span>
                    </span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isActive
                          ? 'text-lux-gold translate-x-0.5'
                          : 'text-stone-400 dark:text-stone-600 opacity-60'
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Quick Controls: Language & Theme */}
            <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-stone-200/60 dark:border-stone-850">
              <button
                onClick={onToggleLocale}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ${
                  darkMode
                    ? 'bg-stone-900/50 border-stone-800 text-stone-300 hover:text-lux-gold hover:border-lux-gold/40'
                    : 'bg-white/60 border-stone-200 text-stone-700 hover:text-lux-gold hover:border-lux-gold/40'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-lux-gold" />
                <span>{locale === 'en' ? 'አማርኛ' : 'English'}</span>
              </button>

              <button
                onClick={onToggleDarkMode}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ${
                  darkMode
                    ? 'bg-stone-900/50 border-stone-800 text-stone-300 hover:text-lux-gold hover:border-lux-gold/40'
                    : 'bg-white/60 border-stone-200 text-stone-700 hover:text-lux-gold hover:border-lux-gold/40'
                }`}
              >
                {darkMode ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-lux-gold" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-lux-gold" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>

            {/* User Account / Auth Card */}
            <div className="pt-2">
              {currentUser ? (
                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    darkMode
                      ? 'bg-stone-900/40 border-stone-850'
                      : 'bg-white/60 border-stone-200/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-lux-gold/20 border border-lux-gold/40 flex items-center justify-center text-lux-gold font-serif font-bold text-xs">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="text-left font-sans">
                      <div className={`text-xs font-bold leading-tight ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                        {currentUser.name}
                      </div>
                      <div className="text-[9px] uppercase tracking-widest text-lux-gold font-mono font-bold mt-0.5">
                        {ROLE_LABELS[currentUser.role] ?? 'Customer'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode
                          ? 'text-stone-300 hover:text-lux-gold hover:bg-stone-800/60'
                          : 'text-stone-600 hover:text-lux-gold hover:bg-stone-100'
                      }`}
                      title="My Profile"
                      aria-label="My Profile"
                    >
                      <UserIcon className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={onLogout}
                      className="p-2 rounded-lg text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Log Out"
                      aria-label="Log Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    darkMode
                      ? 'border-stone-800 bg-stone-900/40 text-stone-300 hover:text-lux-gold hover:border-lux-gold/40'
                      : 'border-stone-200 bg-white/60 text-stone-700 hover:text-lux-gold hover:border-lux-gold/40'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 text-lux-gold" />
                  <span>Sign In / Register</span>
                </Link>
              )}
            </div>

            {/* Book Custom Cake CTA Button */}
            <div className="pt-2">
              <Link
                to="/request"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3.5 px-6 rounded-full bg-linear-to-r from-lux-gold via-lux-gold to-lux-gold-light hover:brightness-105 text-stone-950 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-lux-gold/20 transition-all active:scale-[0.98] font-mono cursor-pointer"
              >
                <CalendarDays className="w-4 h-4 text-stone-950" />
                <span>Order a Custom Cake</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-950" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
