import { useState } from 'react';
import { Cake, CalendarDays, Search, Menu, X, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import HeaderDesktopNav from './HeaderDesktopNav';
import HeaderProfileDropdown from './HeaderProfileDropdown';
import HeaderMobileMenu from './HeaderMobileMenu';
import type { Locale } from '../../i18n/index';
import type { User } from '../../types';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">

        {/* Branding */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 text-left cursor-pointer group"
        >
          <div className={`w-9 h-9 rounded-md flex items-center justify-center transition-all duration-300 ${
            darkMode
              ? 'bg-stone-900 border border-stone-800 text-lux-gold group-hover:bg-lux-gold group-hover:text-stone-950'
              : 'bg-stone-900 text-lux-gold group-hover:bg-lux-gold group-hover:text-stone-950'
          }`}>
            <Cake className="w-5 h-5 stroke-[1.5]" />
          </div>
          <div>
            <span className={`font-serif text-lg sm:text-xl font-bold tracking-wider block ${
              darkMode ? 'text-white' : 'text-stone-900'
            }`}>
              FLAVOUR <span className="italic font-light text-lux-gold font-sans font-normal text-md tracking-widest ml-0.5">BITES</span>
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <HeaderDesktopNav
          darkMode={darkMode}
        />

        {/* Far Right Action Cluster */}
        <div className="hidden lg:flex items-center gap-3">
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

          {/* Book Custom Cake CTA */}
          <Link
            to="/request"
            className="px-4 py-2.5 bg-stone-900 hover:bg-lux-gold text-white hover:text-stone-950 font-bold tracking-wider text-[10px] uppercase transition-all duration-300 rounded-sm flex items-center gap-2 cursor-pointer border border-stone-800 hover:translate-y-[-1px] shadow-xs font-sans whitespace-nowrap shrink-0"
            id="header-cta"
          >
            <CalendarDays className="w-4 h-4 text-lux-gold group-hover:text-stone-950" />
            Book Custom Cake
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`lg:hidden p-2 rounded-sm focus:outline-none cursor-pointer ${darkMode ? 'text-stone-300 hover:text-white' : 'text-stone-600'}`}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
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
