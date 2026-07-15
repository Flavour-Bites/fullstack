import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cake, CalendarDays, LogOut, LogIn, User as UserIcon,
  Sun, Moon, HelpCircle, Compass, ShieldCheck, ShoppingBag, Menu, X, Globe
} from 'lucide-react';
import { t, setLocale as setI18nLocale } from '../i18n';
import type { Locale } from '../i18n';
import type { PageType, User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  darkMode: boolean;
  locale: Locale;
  activePage: PageType;
  adminTab: string;
  isAdminMode: boolean;
  onNavigate: (page: PageType) => void;
  onAdminTabChange: (tab: string) => void;
  onToggleDarkMode: () => void;
  onToggleLocale: () => void;
  onLogout: () => void;
}

export default function Header({
  currentUser, darkMode, locale, activePage, adminTab, isAdminMode,
  onNavigate, onAdminTabChange, onToggleDarkMode, onToggleLocale, onLogout,
}: HeaderProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems: { label: string; page: PageType }[] = [
    { label: 'Home', page: 'home' },
    { label: 'Cake Gallery', page: 'gallery' },
    { label: 'Meet Yodit', page: 'about' },
    { label: 'Reviews', page: 'testimonials' },
    { label: 'Contact', page: 'contact' },
    { label: 'My Profile', page: 'profile' },
  ];

  if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff')) {
    menuItems.push({
      label: currentUser.role === 'admin' ? 'Admin Portal' : 'Staff Workspace',
      page: 'admin',
    });
  }

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md py-3 transition-all shadow-sm ${
      darkMode
        ? 'bg-[#111111]/95 border-b border-stone-850 text-stone-100'
        : 'bg-lux-cream/95 border-b border-stone-200/40 text-stone-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">

        {/* Branding */}
        <button
          onClick={() => {
            if (isAdminMode) {
              onAdminTabChange('dashboard');
            } else {
              onNavigate('home');
            }
          }}
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
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
          {isAdminMode ? (
            <div className="flex items-center gap-2">
              {[
                { id: 'dashboard', label: 'DASHBOARD' },
                { id: 'orders', label: 'ORDERS' },
                { id: 'menu', label: 'MENU' },
                { id: 'categories', label: 'CATEGORIES' },
                { id: 'reviews', label: 'REVIEWS' },
                ...(currentUser?.role === 'admin' ? [{ id: 'users', label: 'USERS' }] : []),
                ...(currentUser?.role === 'admin' ? [{ id: 'recovery', label: 'RECOVERY' }] : [])
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onAdminTabChange(tab.id as any)}
                  className={`text-[10px] uppercase tracking-[0.18em] font-sans transition-all duration-300 cursor-pointer py-1.5 px-3 relative ${
                    adminTab === tab.id
                      ? 'text-lux-gold font-bold border-b border-lux-gold'
                      : darkMode
                        ? 'text-stone-400 hover:text-lux-gold'
                        : 'text-stone-500 hover:text-lux-gold'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {[
                { label: 'HOME', page: 'home' as PageType },
                { label: 'CAKE GALLERY', page: 'gallery' as PageType },
                { label: 'MEET YODIT', page: 'about' as PageType },
                { label: 'REVIEWS', page: 'testimonials' as PageType },
                { label: 'CONTACT', page: 'contact' as PageType },
              ].map((item) => (
                <button
                  key={item.page}
                  onClick={() => onNavigate(item.page)}
                  className={`text-[10px] uppercase tracking-[0.18em] font-sans font-medium transition-all duration-300 cursor-pointer py-1.5 px-2.5 relative ${
                    activePage === item.page
                      ? 'text-lux-gold font-bold border-b border-lux-gold'
                      : darkMode
                        ? 'text-stone-400 hover:text-lux-gold'
                        : 'text-stone-500 hover:text-lux-gold'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* Far Right Action Cluster */}
        <div className="hidden lg:flex items-center gap-3">
          <div
            className="relative shrink-0"
            onMouseEnter={() => setProfileDropdownOpen(true)}
            onMouseLeave={() => setProfileDropdownOpen(false)}
          >
            <div
              className={`flex items-center gap-2 mr-1 cursor-pointer hover:opacity-90 transition-opacity border px-2.5 py-1.5 rounded-sm ${
                darkMode
                  ? 'border-stone-800 bg-stone-900/30 text-white'
                  : 'border-stone-200 bg-white/30 text-stone-900'
              }`}
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setProfileDropdownOpen(!profileDropdownOpen); } }}
              aria-label={currentUser ? `Account: ${currentUser.name}` : 'Sign in'}
              aria-expanded={profileDropdownOpen}
            >
              {currentUser ? (
                <>
                  <div className="w-5.5 h-5.5 rounded-full bg-stone-900 border border-lux-gold/60 text-lux-gold flex items-center justify-center text-[9px] font-sans font-bold uppercase shrink-0">
                    {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                  </div>
                  <span className="text-[10px] uppercase font-sans tracking-[0.14em] font-semibold">
                    {currentUser.name.split(' ')[0]}
                  </span>
                </>
              ) : (
                <>
                  <UserIcon className="w-3.5 h-3.5 text-lux-gold" />
                  <span className="text-[10px] uppercase font-sans tracking-[0.14em] font-semibold">
                    Account
                  </span>
                </>
              )}
            </div>

            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.12 }}
                  className={`absolute right-0 mt-1 w-52 rounded-sm border p-1.5 shadow-2xl z-50 text-left font-sans ${
                    darkMode
                      ? 'bg-[#111111] border-stone-800 text-stone-200 shadow-stone-950/80'
                      : 'bg-[#faf7f2] border-stone-200 text-stone-800 shadow-stone-400/20'
                  }`}
                >
                  {currentUser ? (
                    <div className={`px-3 py-2 border-b ${darkMode ? 'border-stone-800/80' : 'border-stone-200/50'}`}>
                      <div className={`text-[10px] font-bold uppercase tracking-wider truncate mb-0.5 ${darkMode ? 'text-white' : 'text-stone-900'}`}>
                        {currentUser.name}
                      </div>
                      <div className="text-[8px] font-mono uppercase tracking-widest text-lux-gold font-bold">
                        {currentUser.role === 'admin' ? 'System Admin' : currentUser.role === 'staff' ? 'Bakery Staff' : 'Customer'}
                      </div>
                    </div>
                  ) : (
                    <div className={`px-3 py-2 border-b ${darkMode ? 'border-stone-800/80' : 'border-stone-200/50'}`}>
                      <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">
                        Welcome Guest
                      </div>
                    </div>
                  )}

                  <div className="py-1 space-y-0.5">
                    {currentUser ? (
                      isAdminMode ? (
                        <>
                          <button
                            onClick={() => { setProfileDropdownOpen(false); onNavigate('home'); }}
                            className={`w-full text-left px-3 py-1.5 text-[10px] uppercase font-sans font-semibold tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-2 ${
                              isAdminMode || darkMode
                                ? 'hover:bg-stone-900 text-stone-300 hover:text-white'
                                : 'hover:bg-stone-100 text-stone-600 hover:text-stone-950'
                            }`}
                          >
                            <Compass className="w-3.5 h-3.5 text-lux-gold shrink-0" />
                            <span>View Live Site</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { setProfileDropdownOpen(false); onNavigate('profile'); }}
                            className={`w-full text-left px-3 py-1.5 text-[10px] uppercase font-sans font-semibold tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-2 ${
                              isAdminMode || darkMode
                                ? 'hover:bg-stone-900 text-stone-300 hover:text-white'
                                : 'hover:bg-stone-100 text-stone-600 hover:text-stone-950'
                            }`}
                          >
                            <UserIcon className="w-3.5 h-3.5 text-lux-gold shrink-0" />
                            <span>My Profile</span>
                          </button>
                          <button
                            onClick={() => { setProfileDropdownOpen(false); onNavigate('orders'); }}
                            className={`w-full text-left px-3 py-1.5 text-[10px] uppercase font-sans font-semibold tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-2 ${
                              isAdminMode || darkMode
                                ? 'hover:bg-stone-900 text-stone-300 hover:text-white'
                                : 'hover:bg-stone-100 text-stone-600 hover:text-stone-950'
                            }`}
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-lux-gold shrink-0" />
                            <span>My Orders</span>
                          </button>
                          {(currentUser.role === 'admin' || currentUser.role === 'staff') && (
                            <button
                              onClick={() => { setProfileDropdownOpen(false); onNavigate('admin'); }}
                              className={`w-full text-left px-3 py-1.5 text-[10px] uppercase font-sans font-semibold tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-2 ${
                                isAdminMode || darkMode
                                  ? 'hover:bg-stone-900 text-stone-300 hover:text-white'
                                  : 'hover:bg-stone-100 text-stone-600 hover:text-stone-950'
                              }`}
                            >
                              <ShieldCheck className="w-3.5 h-3.5 text-lux-gold shrink-0" />
                              <span>Admin Workspace</span>
                            </button>
                          )}
                        </>
                      )
                    ) : (
                      <>
                        <button
                          onClick={() => { setProfileDropdownOpen(false); onNavigate('auth'); }}
                          className={`w-full text-left px-3 py-1.5 text-[10px] uppercase font-sans font-semibold tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-2 ${
                            isAdminMode || darkMode
                              ? 'hover:bg-stone-900 text-stone-300 hover:text-white'
                              : 'hover:bg-stone-100 text-stone-600 hover:text-stone-950'
                          }`}
                        >
                          <LogIn className="w-3.5 h-3.5 text-lux-gold shrink-0" />
                          <span>Sign In / Join</span>
                        </button>
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            alert("Flavour Bites Service Desk:\n\nReach our studio team at hello@flavourbites.com or call our master desk line at +251 911 234567.");
                          }}
                          className={`w-full text-left px-3 py-1.5 text-[10px] uppercase font-sans font-semibold tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-2 ${
                            isAdminMode || darkMode
                              ? 'hover:bg-stone-900 text-stone-300 hover:text-white'
                              : 'hover:bg-stone-100 text-stone-600 hover:text-stone-950'
                          }`}
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-lux-gold shrink-0" />
                          <span>Help / Support</span>
                        </button>
                      </>
                    )}

                    <div className={`my-1 border-t border-b py-1.5 ${isAdminMode || darkMode ? 'border-stone-850' : 'border-stone-200/50'}`}>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleDarkMode(); }}
                        aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
                        className={`w-full text-left px-3 py-1 text-[10px] rounded-sm transition-colors cursor-pointer flex items-center justify-between group ${
                          isAdminMode || darkMode
                            ? 'hover:bg-stone-900 text-stone-300 hover:text-white'
                            : 'hover:bg-stone-100 text-stone-600 hover:text-stone-950'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {darkMode ? <Sun className="w-3.5 h-3.5 text-lux-gold shrink-0" /> : <Moon className="w-3.5 h-3.5 text-lux-gold shrink-0" />}
                          <span className="font-sans font-medium uppercase tracking-wider text-[9.5px]">
                            {darkMode ? 'Light Theme' : 'Dark Theme'}
                          </span>
                        </div>
                        <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors relative flex items-center shrink-0 ${darkMode ? 'bg-lux-gold' : 'bg-stone-300'}`}>
                          <div className={`w-3.5 h-3.5 rounded-full bg-stone-950 shadow-sm transform duration-300 ${darkMode ? 'translate-x-3.5' : 'translate-x-0'}`} />
                        </div>
                      </button>
                    </div>

                    {currentUser && (
                      <div className={`border-t pt-1 ${isAdminMode || darkMode ? 'border-stone-850' : 'border-stone-200/50'}`}>
                        <button
                          onClick={() => { setProfileDropdownOpen(false); onLogout(); }}
                          className={`w-full text-left px-3 py-1.5 text-[10px] uppercase font-sans font-bold tracking-wider rounded-sm transition-colors cursor-pointer flex items-center gap-2 ${
                            isAdminMode || darkMode
                              ? 'text-red-400 hover:bg-stone-900 hover:text-red-350'
                              : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                          }`}
                        >
                          <LogOut className="w-3.5 h-3.5 shrink-0" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Locale Switcher */}
          <button
            onClick={onToggleLocale}
            className={`px-2.5 py-1.5 rounded-sm font-mono text-[10px] uppercase font-bold tracking-wider border transition-all cursor-pointer shrink-0 ${
              isAdminMode || darkMode
                ? 'border-stone-800 text-stone-400 hover:text-lux-gold hover:border-lux-gold/50 bg-stone-900/30'
                : 'border-stone-200 text-stone-500 hover:text-lux-gold hover:border-lux-gold/50 bg-white/30'
            }`}
            title="Switch language"
          >
            <Globe className="w-3.5 h-3.5 inline-block mr-1" />
            {locale === 'en' ? 'AM' : 'EN'}
          </button>

          {/* Book Custom Cake CTA */}
          {!isAdminMode && (
            <button
              onClick={() => onNavigate('request')}
              className="px-4 py-2.5 bg-stone-900 hover:bg-lux-gold text-white hover:text-stone-950 font-bold tracking-wider text-[10px] uppercase transition-all duration-300 rounded-sm flex items-center gap-2 cursor-pointer border border-stone-800 hover:translate-y-[-1px] shadow-xs font-sans whitespace-nowrap shrink-0"
              id="header-cta"
            >
              <CalendarDays className="w-4 h-4 text-lux-gold group-hover:text-stone-950" />
              Book Custom Cake
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`lg:hidden p-2 rounded-sm focus:outline-none cursor-pointer ${isAdminMode || darkMode ? 'text-stone-300 hover:text-white' : 'text-stone-600'}`}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`lg:hidden border-b overflow-hidden font-sans ${
              isAdminMode || darkMode
                ? 'bg-stone-950 border-stone-900 text-white'
                : 'bg-lux-cream border-stone-200/50 text-stone-800'
            }`}
          >
            <nav className={`flex flex-col gap-4 p-6 border-t ${isAdminMode || darkMode ? 'bg-stone-900/60 border-stone-800' : 'bg-white border-stone-100'}`}>
              {isAdminMode ? (
                [
                  { id: 'dashboard', label: 'Dashboard Overview' },
                  { id: 'orders', label: 'Reservation Inquiries' },
                  { id: 'menu', label: 'Studio Cake Menu' },
                  { id: 'categories', label: 'Cake Categories' },
                  { id: 'reviews', label: 'Customer Reviews' },
                  ...(currentUser?.role === 'admin' ? [{ id: 'users', label: 'Registered Clients' }] : []),
                  ...(currentUser?.role === 'admin' ? [{ id: 'recovery', label: 'Account Recovery' }] : [])
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { onAdminTabChange(tab.id as any); setMobileMenuOpen(false); }}
                    className={`text-left text-xs uppercase tracking-widest font-semibold py-2 border-b cursor-pointer ${
                      adminTab === tab.id
                        ? 'text-lux-gold border-lux-gold/30 pl-2 font-bold'
                        : 'text-stone-400 border-stone-800/40'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))
              ) : (
                [
                  { label: 'Home', page: 'home' as PageType },
                  { label: 'Cake Gallery', page: 'gallery' as PageType },
                  { label: 'Meet Yodit', page: 'about' as PageType },
                  { label: 'Reviews', page: 'testimonials' as PageType },
                  { label: 'Contact', page: 'contact' as PageType },
                ].map((item) => (
                  <button
                    key={item.page}
                    onClick={() => { onNavigate(item.page); setMobileMenuOpen(false); }}
                    className={`text-left text-xs uppercase tracking-widest font-semibold py-2 border-b cursor-pointer ${
                      activePage === item.page
                        ? 'text-lux-gold pl-2 border-lux-gold/20 font-bold'
                        : isAdminMode || darkMode
                          ? 'text-stone-400 border-stone-800/45'
                          : 'text-stone-600 border-stone-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))
              )}

              <div className={`pt-2 border-b pb-2 flex justify-between items-center ${isAdminMode || darkMode ? 'border-stone-800' : 'border-stone-150'}`}>
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Language</span>
                <button
                  onClick={onToggleLocale}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-800 rounded-sm text-xs text-lux-gold font-mono cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{locale === 'en' ? 'አማርኛ' : 'English'}</span>
                </button>
              </div>

              <div className={`pt-2 border-b pb-2 flex justify-between items-center ${isAdminMode || darkMode ? 'border-stone-800' : 'border-stone-150'}`}>
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Atmosphere Tone</span>
                <button onClick={onToggleDarkMode} className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-800 rounded-sm text-xs text-lux-gold font-mono cursor-pointer">
                  {darkMode ? <><Sun className="w-3.5 h-3.5" /><span>Light Mode</span></> : <><Moon className="w-3.5 h-3.5" /><span>Dark Mode</span></>}
                </button>
              </div>

              <div className={`pt-2 border-b pb-2 ${isAdminMode || darkMode ? 'border-stone-800' : 'border-stone-150'}`}>
                {currentUser ? (
                  <div className="flex items-center justify-between">
                    <div className="text-left font-sans">
                      <span className="text-[10px] text-stone-400 block uppercase tracking-wider font-semibold">User:</span>
                      <div className={`text-xs font-bold leading-none mt-0.5 ${isAdminMode || darkMode ? 'text-white' : 'text-stone-800'}`}>
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
                  <button onClick={() => { onNavigate('auth'); setMobileMenuOpen(false); }} className="text-xs text-lux-gold font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In / Register
                  </button>
                )}
              </div>

              {!isAdminMode && (
                <button
                  onClick={() => { onNavigate('request'); setMobileMenuOpen(false); }}
                  className="w-full mt-4 py-3 bg-stone-900 hover:bg-lux-gold hover:text-stone-950 text-white font-semibold text-xs tracking-widest uppercase rounded-sm flex items-center justify-center gap-2 transition-colors duration-300 cursor-pointer border border-stone-800"
                >
                  <CalendarDays className="w-4 h-4 text-lux-gold" />
                  Book Custom Cake
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
