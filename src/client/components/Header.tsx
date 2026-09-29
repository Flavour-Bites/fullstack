import { useState } from 'react';
import { CalendarDays, Search, Menu, X, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import HeaderDesktopNav from './HeaderDesktopNav';
import HeaderProfileDropdown from './HeaderProfileDropdown';
import HeaderMobileMenu from './HeaderMobileMenu';
import type { Locale } from '@client/i18n/index';
import type { User } from '@shared/types';

interface HeaderProps {
  currentUser: User | null;
  darkMode: boolean;
  locale: Locale;
  onToggleDarkMode: () => void;
  onToggleLocale: () => void;
  onLogout: () => void;
  onSearchOpen: () => void;
}

export default function Header({
  currentUser, darkMode, locale,
  onToggleDarkMode, onToggleLocale, onLogout, onSearchOpen,
}: Readonly<HeaderProps>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md py-3 transition-all shadow-sm ${
      darkMode
        ? 'bg-stone-950/95 border-b border-stone-850 text-stone-100'
        : 'bg-lux-cream/95 border-b border-stone-200/40 text-stone-900'
    }`}>
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 flex items-center justify-between">

        {/* Left: Branding */}
        <div className="flex-1 flex items-center justify-start">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className={`w-9 h-9 rounded-md flex items-center justify-center transition-all duration-300 border ${
              darkMode
                ? 'bg-stone-900 border-stone-800 text-lux-gold group-hover:border-lux-gold group-hover:shadow-[0_0_12px_rgba(202,168,110,0.4)] group-hover:scale-105'
                : 'bg-stone-900 border-stone-800 text-lux-gold group-hover:border-lux-gold group-hover:shadow-[0_0_12px_rgba(202,168,110,0.35)] group-hover:scale-105'
            }`}>
              <img
                src="/favicon_pink_f_1782078000588.jpg"
                alt="Flavour Bites"
                className="w-full h-full rounded-full object-cover transition-transform duration-300 group-hover:rotate-3"
              />
            </div>
            <div>
              <span className={`font-serif text-lg sm:text-xl font-bold tracking-wider block transition-colors duration-300 ${
                darkMode ? 'text-white group-hover:text-lux-gold' : 'text-stone-900 group-hover:text-lux-gold'
              }`}>
                FLAVOUR <span className="italic font-light text-lux-gold font-sans font-normal text-md tracking-widest ml-0.5">BITES</span>
              </span>
            </div>
          </button>
        </div>

        {/* Center: Desktop Navigation */}
        <div className="hidden lg:flex flex-none items-center justify-center">
          <HeaderDesktopNav
            darkMode={darkMode}
          />
        </div>

        {/* Right: Desktop Action Cluster */}
        <div className="hidden lg:flex flex-1 items-center justify-end gap-3">
          {/* Search */}
          <button
            onClick={onSearchOpen}
            className={`p-2 rounded-sm transition-all cursor-pointer ${
              darkMode
                ? 'text-stone-400 hover:text-lux-gold hover:bg-stone-900/50'
                : 'text-stone-500 hover:text-lux-gold hover:bg-stone-100'
            }`}
            aria-label="Search"
            title="Search (⌘K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Profile Dropdown */}
          <HeaderProfileDropdown
            currentUser={currentUser}
            darkMode={darkMode}
            onToggleDarkMode={onToggleDarkMode}
            onLogout={onLogout}
          />

          {/* Locale Switcher */}
          <button
            onClick={onToggleLocale}
            className={`px-2.5 py-1.5 rounded-sm font-mono text-[10px] uppercase font-bold tracking-wider border transition-all cursor-pointer shrink-0 ${
              darkMode
                ? 'border-stone-800 text-stone-400 hover:text-lux-gold hover:border-lux-gold/50 bg-stone-900/30'
                : 'border-stone-200 text-stone-500 hover:text-lux-gold hover:border-lux-gold/50 bg-white/30'
            }`}
            title="Switch language"
          >
            <Globe className="w-3.5 h-3.5 inline-block mr-1" />
            {locale === 'en' ? 'AM' : 'EN'}
          </button>

          <Link
            to="/request"
            className="hidden min-[1300px]:inline-flex px-4 py-2.5 bg-stone-900 hover:bg-lux-gold text-white hover:text-stone-950 font-bold tracking-wider text-[10px] uppercase transition-all duration-300 rounded-sm items-center gap-2 cursor-pointer border border-stone-800 hover:translate-y-[-1px] shadow-xs font-sans whitespace-nowrap shrink-0"
            id="header-cta"
          >
            <CalendarDays className="w-4 h-4 text-lux-gold group-hover:text-stone-950" />
            Book Custom Cake
          </Link>
        </div>

        {/* Mobile Action Cluster: Search + Hamburger Menu */}
        <div className="flex lg:hidden items-center gap-1.5">
          <button
            onClick={onSearchOpen}
            className={`p-2 rounded-full transition-all cursor-pointer flex items-center justify-center ${
              darkMode
                ? 'text-stone-300 hover:text-lux-gold hover:bg-stone-900/60 active:scale-95'
                : 'text-stone-700 hover:text-lux-gold hover:bg-stone-200/50 active:scale-95'
            }`}
            aria-label="Search Cakes and FAQs"
            title="Search"
          >
            <Search className="w-5 h-5 text-lux-gold" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-full focus:outline-none transition-all cursor-pointer flex items-center justify-center ${
              mobileMenuOpen
                ? darkMode
                  ? 'bg-stone-900 text-lux-gold'
                  : 'bg-stone-200/60 text-stone-900'
                : darkMode
                  ? 'text-stone-300 hover:text-white hover:bg-stone-900/60'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/50'
            }`}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <HeaderMobileMenu
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        currentUser={currentUser}
        darkMode={darkMode}
        locale={locale}
        onToggleLocale={onToggleLocale}
        onToggleDarkMode={onToggleDarkMode}
        onSearchOpen={onSearchOpen}
        onLogout={onLogout}
      />
    </header>
  );
}
