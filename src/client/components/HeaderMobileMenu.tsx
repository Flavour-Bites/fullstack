import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Globe, Sun, Moon, LogOut, LogIn, CalendarDays } from 'lucide-react';
import type { Locale } from '@client/i18n/index';
import type { User } from '../../types';

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

export default function HeaderMobileMenu({
  mobileMenuOpen,
  setMobileMenuOpen,
  currentUser,
  darkMode,
  locale,
  onToggleLocale,
  onToggleDarkMode,
  onSearchOpen,
  onLogout,
}: Readonly<HeaderMobileMenuProps>) {
  const location = useLocation();

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`lg:hidden border-b overflow-hidden font-sans ${
            darkMode
              ? 'bg-stone-950 border-stone-900 text-white'
              : 'bg-lux-cream border-stone-200/50 text-stone-800'
          }`}
        >
          <nav className={`flex flex-col gap-4 p-6 border-t ${darkMode ? 'bg-stone-900/60 border-stone-800' : 'bg-white border-stone-100'}`}>
            {[
              { label: 'Home', path: '/' },
              { label: 'Cake Gallery', path: '/gallery' },
              { label: 'Meet Yodit', path: '/about' },
              { label: 'Contact', path: '/contact' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => { setMobileMenuOpen(false); }}
                className={`text-left block text-xs uppercase tracking-widest font-semibold py-2 border-b cursor-pointer transition-all ${
                  location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                    ? 'text-lux-gold pl-3 border-lux-gold/30 font-bold border-l-2 bg-lux-gold/5'
                    : darkMode
                      ? 'text-stone-400 border-stone-800/45 hover:text-stone-200'
                      : 'text-stone-600 border-stone-100 hover:text-stone-900'
                }`}
              >
                {item.label}
              </Link>
            ))}

            <button
              onClick={() => { onSearchOpen(); setMobileMenuOpen(false); }}
              className={`flex items-center gap-2 py-2 border-b text-left text-xs uppercase tracking-widest font-semibold cursor-pointer ${darkMode ? 'border-stone-800 text-stone-400 hover:text-stone-200' : 'border-stone-100 text-stone-600 hover:text-stone-900'}`}
            >
              <Search className="w-3.5 h-3.5 text-lux-gold" />
              Search Cakes & FAQs
            </button>

            <div className={`pt-2 border-b pb-2 flex justify-between items-center ${darkMode ? 'border-stone-800' : 'border-stone-150'}`}>
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Language</span>
              <button
                onClick={onToggleLocale}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-800 rounded-sm text-xs text-lux-gold font-mono cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{locale === 'en' ? 'አማርኛ' : 'English'}</span>
              </button>
            </div>

            <div className={`pt-2 border-b pb-2 flex justify-between items-center ${darkMode ? 'border-stone-800' : 'border-stone-150'}`}>
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Theme</span>
              <button onClick={onToggleDarkMode} className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-800 rounded-sm text-xs text-lux-gold font-mono cursor-pointer">
                {darkMode ? <><Sun className="w-3.5 h-3.5" /><span>Light Mode</span></> : <><Moon className="w-3.5 h-3.5" /><span>Dark Mode</span></>}
              </button>
            </div>

            <div className={`pt-2 border-b pb-2 ${darkMode ? 'border-stone-800' : 'border-stone-150'}`}>
              {currentUser ? (
                <div className="flex items-center justify-between">
                  <div className="text-left font-sans">
                    <span className="text-[10px] text-stone-400 block uppercase tracking-wider font-semibold">User:</span>
                    <div className={`text-xs font-bold leading-none mt-0.5 ${darkMode ? 'text-white' : 'text-stone-800'}`}>
                      {currentUser.name}
                    </div>
                    <span className="text-[9px] uppercase tracking-widest text-lux-gold font-bold">{currentUser.role}</span>
                  </div>
                  <button onClick={onLogout} className="text-xs text-red-500 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer">
                    <LogOut className="w-3.5 h-3.5" />
                    Log Out
                  </button>
                </div>
              ) : (
                <Link to="/auth" onClick={() => { setMobileMenuOpen(false); }} className="text-xs text-lux-gold font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In / Register
                </Link>
              )}
            </div>

            <Link
              to="/request"
              onClick={() => { setMobileMenuOpen(false); }}
              className="w-full mt-4 py-3 bg-stone-900 hover:bg-lux-gold hover:text-stone-950 text-white font-semibold text-xs tracking-widest uppercase rounded-sm flex items-center justify-center gap-2 transition-colors duration-300 cursor-pointer border border-stone-800"
            >
              <CalendarDays className="w-4 h-4 text-lux-gold" />
              Book Custom Cake
            </Link>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
