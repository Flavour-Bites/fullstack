import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cake, CalendarDays, Instagram, Mail, Compass, Menu, X, Send, LogOut, LogIn, User as UserIcon, Sun, Moon, HelpCircle, ExternalLink, ShieldCheck, ShoppingBag, Globe } from 'lucide-react';
import { PageType, CakeGalleryItem, User } from './types';

// Views
import HomeView from './components/HomeView';
import GalleryView from './components/GalleryView';
import RequestFormView from './components/RequestFormView';
import AboutView from './components/AboutView';
import TestimonialsView from './components/TestimonialsView';
import ContactView from './components/ContactView';
import CakeAssistantBot from './components/CakeAssistantBot';
import ProfileView from './components/ProfileView';
import AdminView from './components/AdminView';
import AuthView from './components/AuthView';

import { setLocale, getLocale } from './i18n';
import type { Locale } from './i18n';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('flavourbites_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activePage, setActivePage] = useState<PageType>('home');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'orders' | 'menu' | 'categories' | 'reviews' | 'users'>('dashboard');
  const [locale, setLocaleState] = useState<Locale>(() => getLocale());
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [selectedCake, setSelectedCake] = useState<CakeGalleryItem | null>(null);
  const [prefilledCake, setPrefilledCake] = useState<CakeGalleryItem | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle HTML document body class mapping for tailwind support
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const navigateTo = (page: PageType) => {
    let targetPage = page;
    if (page === 'orders') targetPage = 'profile';
    setActivePage(targetPage);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCommissionCake = (cake: CakeGalleryItem) => {
    setPrefilledCake(cake);
    setSelectedCake(null); // Close lightbox
    navigateTo('request');
  };

  const handleClearPrefilledCake = () => {
    setPrefilledCake(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('flavourbites_user');
    setCurrentUser(null);
    navigateTo('home');
  };

  const menuItems: { label: string; page: PageType }[] = [
    { label: 'Home', page: 'home' },
    { label: 'Cake Gallery', page: 'gallery' },
    { label: 'Meet Yodit', page: 'about' },
    { label: 'Reviews', page: 'testimonials' },
    { label: 'Contact', page: 'contact' },
    { label: 'My Profile', page: 'profile' }
  ];

  if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff')) {
    menuItems.push({ 
      label: currentUser.role === 'admin' ? 'Admin Portal' : 'Staff Workspace', 
      page: 'admin' 
    });
  }

  const isAdminMode = currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff') && activePage === 'admin';

  return (
    <div className={`min-h-screen flex flex-col justify-between selection:bg-lux-gold transition-colors duration-300 relative overflow-x-hidden ${
      darkMode 
        ? 'bg-[#111111] text-stone-100' 
        : 'bg-lux-cream text-stone-800'
    }`}>
      {/* Golden accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-stone-900 via-lux-gold to-stone-900 fixed top-0 left-0 z-[1000]" />

      {/* Main floating Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-md py-3 transition-all shadow-sm ${
        darkMode
          ? 'bg-[#111111]/95 border-b border-stone-850 text-stone-100'
          : 'bg-lux-cream/95 border-b border-stone-200/40 text-stone-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          
          {/* Elegant Script Branding/Logo */}
          <button
            onClick={() => {
              if (isAdminMode) {
                setAdminTab('dashboard');
              } else {
                navigateTo('home');
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
              // State 2: Admin View Navbar Layout (No decorative brackets, clean list, sans-serif, 1px gold active indicator)
              <div className="flex items-center gap-2">
                {[
                  { id: 'dashboard', label: 'DASHBOARD' },
                  { id: 'orders', label: 'ORDERS' },
                  { id: 'menu', label: 'MENU' },
                  { id: 'categories', label: 'CATEGORIES' },
                  { id: 'reviews', label: 'REVIEWS' },
                  ...(currentUser?.role === 'admin' ? [{ id: 'users', label: 'USERS' }] : [])
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAdminTab(tab.id as any)}
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
              // State 1: Customer View Navbar Layout (Only: HOME, CAKE GALLERY, MEET YODIT, REVIEWS, CONTACT, sans-serif, uppercase, tracking, 15px margins, active 1px underline)
              <div className="flex items-center gap-1.5">
                {[
                  { label: 'HOME', page: 'home' as PageType },
                  { label: 'CAKE GALLERY', page: 'gallery' as PageType },
                  { label: 'MEET YODIT', page: 'about' as PageType },
                  { label: 'REVIEWS', page: 'testimonials' as PageType },
                  { label: 'CONTACT', page: 'contact' as PageType }
                ].map((item) => (
                  <button
                    key={item.page}
                    onClick={() => navigateTo(item.page)}
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
            
            {/* Account Dropdown Container (Always present - handles guest & users with theme toggle switch inside) */}
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
                title="Account Settings"
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

              {/* Account Dropdown Options popup */}
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
                    {/* Header profile info */}
                    {currentUser ? (
                      <div className={`px-3 py-2 border-b ${
                        darkMode ? 'border-stone-800/80' : 'border-stone-200/50'
                      }`}>
                        <div className={`text-[10px] font-bold uppercase tracking-wider truncate mb-0.5 ${
                          darkMode ? 'text-white' : 'text-stone-900'
                        }`}>
                          {currentUser.name}
                        </div>
                        <div className="text-[8px] font-mono uppercase tracking-widest text-lux-gold font-bold">
                          {currentUser.role === 'admin' ? 'System Admin' : currentUser.role === 'staff' ? 'Bakery Staff' : 'Customer'}
                        </div>
                      </div>
                    ) : (
                      <div className={`px-3 py-2 border-b ${
                        darkMode ? 'border-stone-800/80' : 'border-stone-200/50'
                      }`}>
                        <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">
                          Welcome Guest
                        </div>
                      </div>
                    )}

                    {/* Navigation Options list */}
                    <div className="py-1 space-y-0.5">
                      {currentUser ? (
                        isAdminMode ? (
                          // State 2: Admin View Dropdown (View Live Site, Theme Toggle, Log Out)
                          <>
                            <button
                              onClick={() => {
                                setProfileDropdownOpen(false);
                                navigateTo('home');
                              }}
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
                          // State 1: Customer View Dropdown (My Profile, My Orders, Theme Toggle, Admin Workspace, Log Out)
                          <>
                            <button
                              onClick={() => {
                                setProfileDropdownOpen(false);
                                navigateTo('profile');
                              }}
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
                              onClick={() => {
                                setProfileDropdownOpen(false);
                                navigateTo('orders');
                              }}
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
                                onClick={() => {
                                  setProfileDropdownOpen(false);
                                  navigateTo('admin');
                                }}
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
                        // Guest Visitor options
                        <>
                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              navigateTo('auth');
                            }}
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

                      {/* Embedded Theme Switcher Switch */}
                      <div className={`my-1 border-t border-b py-1.5 ${
                        isAdminMode || darkMode ? 'border-stone-850' : 'border-stone-200/50'
                      }`}>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDarkMode(!darkMode);
                          }}
                          className={`w-full text-left px-3 py-1 text-[10px] rounded-sm transition-colors cursor-pointer flex items-center justify-between group ${
                            isAdminMode || darkMode
                              ? 'hover:bg-stone-900 text-stone-300 hover:text-white'
                              : 'hover:bg-stone-100 text-stone-600 hover:text-stone-950'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {darkMode ? (
                              <Sun className="w-3.5 h-3.5 text-lux-gold shrink-0" />
                            ) : (
                              <Moon className="w-3.5 h-3.5 text-lux-gold shrink-0" />
                            )}
                            <span className="font-sans font-medium uppercase tracking-wider text-[9.5px]">
                              {darkMode ? 'Light Theme' : 'Dark Theme'}
                            </span>
                          </div>
                          <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors relative flex items-center shrink-0 ${
                            darkMode ? 'bg-lux-gold' : 'bg-stone-300'
                          }`}>
                            <div className={`w-3.5 h-3.5 rounded-full bg-stone-950 shadow-sm transform duration-300 ${
                              darkMode ? 'translate-x-3.5' : 'translate-x-0'
                            }`} />
                          </div>
                        </button>
                      </div>

                      {/* Log Out option */}
                      {currentUser && (
                        <div className={`border-t pt-1 ${
                          isAdminMode || darkMode ? 'border-stone-850' : 'border-stone-200/50'
                        }`}>
                          <button
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              handleLogout();
                            }}
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
              onClick={() => {
                const next: Locale = locale === 'en' ? 'am' : 'en';
                setLocaleState(next);
                setLocale(next);
              }}
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

            {/* Book Custom Cake CTA button - Hidden conditionally in Admin Mode */}
            {!isAdminMode && (
              <button
                onClick={() => navigateTo('request')}
                className="px-4 py-2.5 bg-stone-900 hover:bg-lux-gold text-white hover:text-stone-950 font-bold tracking-wider text-[10px] uppercase transition-all duration-300 rounded-sm flex items-center gap-2 cursor-pointer border border-stone-800 hover:translate-y-[-1px] shadow-xs font-sans whitespace-nowrap shrink-0"
                id="header-cta"
              >
                <CalendarDays className="w-4 h-4 text-lux-gold group-hover:text-stone-950" />
                Book Custom Cake
              </button>
            )}
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 rounded-sm focus:outline-none cursor-pointer ${
              isAdminMode || darkMode ? 'text-stone-300 hover:text-white' : 'text-stone-600'
            }`}
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
              <nav className={`flex flex-col gap-4 p-6 border-t ${
                isAdminMode || darkMode 
                  ? 'bg-stone-900/60 border-stone-800' 
                  : 'bg-white border-stone-100'
              }`}>
                {isAdminMode ? (
                  // Admin Mobile Options switcher
                  [
                    { id: 'dashboard', label: 'Dashboard Overview' },
                    { id: 'orders', label: 'Reservation Inquiries' },
                    { id: 'menu', label: 'Studio Cake Menu' },
                    { id: 'categories', label: 'Cake Categories' },
                    { id: 'reviews', label: 'Customer Reviews' },
                    ...(currentUser?.role === 'admin' ? [{ id: 'users', label: 'Registered Clients' }] : [])
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setAdminTab(tab.id as any);
                        setMobileMenuOpen(false);
                      }}
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
                  // Public Mobile Option List
                  [
                    { label: 'Home', page: 'home' as PageType },
                    { label: 'Cake Gallery', page: 'gallery' as PageType },
                    { label: 'Meet Yodit', page: 'about' as PageType },
                    { label: 'Reviews', page: 'testimonials' as PageType },
                    { label: 'Contact', page: 'contact' as PageType }
                  ].map((item) => (
                    <button
                      key={item.page}
                      onClick={() => navigateTo(item.page)}
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

                {/* Mobile Locale Switcher */}
                <div className={`pt-2 border-b pb-2 flex justify-between items-center ${
                  isAdminMode || darkMode ? 'border-stone-800' : 'border-stone-150'
                }`}>
                  <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Language</span>
                  <button
                    onClick={() => {
                      const next: Locale = locale === 'en' ? 'am' : 'en';
                      setLocaleState(next);
                      setLocale(next);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-800 rounded-sm text-xs text-lux-gold font-mono cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{locale === 'en' ? 'አማርኛ' : 'English'}</span>
                  </button>
                </div>

                {/* Mobile Theme Toggle integration */}
                <div className={`pt-2 border-b pb-2 flex justify-between items-center ${
                  isAdminMode || darkMode ? 'border-stone-800' : 'border-stone-150'
                }`}>
                  <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Atmosphere Tone</span>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-800 rounded-sm text-xs text-lux-gold font-mono cursor-pointer"
                  >
                    {darkMode ? (
                      <>
                        <Sun className="w-3.5 h-3.5" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-3.5 h-3.5" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Mobile login indicator & login/logout button */}
                <div className={`pt-2 border-b pb-2 ${
                  isAdminMode || darkMode ? 'border-stone-800' : 'border-stone-150'
                }`}>
                  {currentUser ? (
                    <div className="flex items-center justify-between">
                      <div className="text-left font-sans">
                        <span className="text-[10px] text-stone-400 block uppercase tracking-wider font-semibold">User:</span>
                        <div className={`text-xs font-bold leading-none mt-0.5 ${
                          isAdminMode || darkMode ? 'text-white' : 'text-stone-800'
                        }`}>
                          {currentUser.name}
                        </div>
                        <span className="text-[9px] uppercase tracking-widest text-lux-gold font-bold">
                          {currentUser.role}
                        </span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="text-xs text-red-500 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Log Out
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigateTo('auth')}
                      className="text-xs text-lux-gold font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Sign In / Register
                    </button>
                  )}
                </div>
                
                {/* Mobile Commission trigger - conditionally hidden for admin */}
                {!isAdminMode && (
                  <button
                    onClick={() => navigateTo('request')}
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

      {/* Main Core Screen Contents with transition wrapper */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            {activePage === 'home' && (
              <HomeView
                onNavigate={navigateTo}
                onSelectCake={(cake) => {
                  setSelectedCake(cake);
                  setActivePage('gallery');
                }}
              />
            )}
            {activePage === 'gallery' && (
              <GalleryView
                selectedCake={selectedCake}
                onClearSelectedCake={() => setSelectedCake(null)}
                onSelectCake={setSelectedCake}
                onCommissionCake={handleCommissionCake}
              />
            )}
            {activePage === 'request' && (
              currentUser ? (
                <RequestFormView
                  prefilledCake={prefilledCake}
                  onClearPrefilledCake={handleClearPrefilledCake}
                  currentUser={currentUser}
                />
              ) : (
                <AuthView
                  onAuthSuccess={(user) => {
                    setCurrentUser(user);
                    navigateTo('request');
                  }}
                  title="Sign In to Book a Cake"
                  subtitle="Authenticate to create your custom cake commission and follow its progress."
                />
              )
            )}
            {activePage === 'about' && <AboutView />}
            {activePage === 'testimonials' && <TestimonialsView currentUser={currentUser} />}
            {activePage === 'contact' && <ContactView />}
            {(activePage === 'profile' || activePage === 'orders') && (
              currentUser ? (
                <ProfileView currentUser={currentUser} onLogout={handleLogout} onNavigate={navigateTo} />
              ) : (
                <AuthView
                  onAuthSuccess={(user) => {
                    setCurrentUser(user);
                    navigateTo('profile');
                  }}
                  title="Atelier Profile & Orders"
                  subtitle="Log in to view live statuses and custom design files for your inquiries."
                />
              )
            )}
            {activePage === 'admin' && (
              currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff') ? (
                <AdminView activeTab={adminTab} onTabChange={setAdminTab} currentUser={currentUser} />
              ) : (
                <AuthView
                  onAuthSuccess={(user) => {
                    setCurrentUser(user);
                    if (user.role === 'admin' || user.role === 'staff') {
                      navigateTo('admin');
                    } else {
                      navigateTo('home');
                    }
                  }}
                  title="Yodit's Direct Control Board"
                  subtitle="Access restricted to Flavour Bites staff or admin. Enter authorized credentials."
                  defaultMode="login"
                />
              )
            )}
            {activePage === 'auth' && (
              <AuthView
                onAuthSuccess={(user) => {
                  setCurrentUser(user);
                  if (user.role === 'admin' || user.role === 'staff') {
                    navigateTo('admin');
                  } else {
                     navigateTo('home');
                  }
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Immersive Luxury Footer */}
      {!isAdminMode ? (
        <footer className="bg-[#111111] text-white border-t border-stone-800 pt-16 pb-8 text-xs relative z-10 font-sans">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-stone-850">
            
            {/* Branding */}
            <div className="md:col-span-4 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-sm bg-stone-800 flex items-center justify-center text-lux-gold">
                  <Cake className="w-4.5 h-4.5" />
                </div>
                <span className="font-serif text-lg font-semibold tracking-tight text-white block">
                  FLAVOUR <span className="italic font-light text-lux-gold font-sans font-normal text-sm tracking-widest ml-0.5">BITES</span>
                </span>
              </div>
              <p className="text-stone-400 font-light leading-relaxed max-w-sm">
                Commission-only cake customizer and home-based artisan bakery. We hand-craft custom landmark birthday cakes, celebratory bakes, and gourmet treats. Pre-scheduled pickups at our home studio in Addis Ababa, Ethiopia.
              </p>
              <div className="flex gap-4 pt-2">
                <a href="https://t.me/flavourbites_placeholder" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-lux-gold transition-colors block" aria-label="Follow us on Telegram">
                  <Send className="w-5 h-5 rotate-[-25deg]" />
                </a>
                <a href="#instagram" className="text-stone-400 hover:text-lux-gold transition-colors block" aria-label="Follow us on Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#mail" className="text-stone-400 hover:text-lux-gold transition-colors block" aria-label="Email our concierge">
                  <Mail className="w-5 h-5" />
                </a>
                <a href="#about" onClick={(e) => { e.preventDefault(); navigateTo('about'); }} className="text-stone-400 hover:text-lux-gold transition-colors block cursor-pointer text-left" aria-label="Compass coordinates">
                  <Compass className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Sitemaps */}
            <div className="md:col-span-3 col-span-1 space-y-4">
              <h4 className="text-[10px] uppercase font-mono tracking-widest text-lux-gold font-semibold">The Studio</h4>
              <ul className="space-y-2.5 font-light text-stone-300">
                <li>
                  <button onClick={() => navigateTo('home')} className="hover:text-lux-gold transition-colors cursor-pointer text-left font-sans">
                    Welcome Salon
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('about')} className="hover:text-lux-gold transition-colors cursor-pointer text-left font-sans">
                    Meet Yodit Ashenafi
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('testimonials')} className="hover:text-lux-gold transition-colors cursor-pointer text-left font-sans">
                    Celebration Stories
                  </button>
                </li>
                <li>
                  <button onClick={() => navigateTo('contact')} className="hover:text-lux-gold transition-colors cursor-pointer text-left font-sans">
                    Coordinates Office
                  </button>
                </li>
              </ul>
            </div>

            {/* Catalog Categories */}
            <div className="md:col-span-4 col-span-1 space-y-4">
              <h4 className="text-[10px] uppercase font-mono tracking-widest text-lux-gold font-semibold">Cake Categories</h4>
              <ul className="space-y-2.5 font-light text-stone-300">
                <li>
                  <button onClick={() => { setSelectedCake(null); navigateTo('gallery'); }} className="hover:text-lux-gold transition-colors cursor-pointer text-left font-sans">
                    Bespoke Celebrations
                  </button>
                </li>
                <li>
                  <button onClick={() => { setSelectedCake(null); navigateTo('gallery'); }} className="hover:text-lux-gold transition-colors cursor-pointer text-left font-sans">
                    Elite Birthday Bakes
                  </button>
                </li>
                <li>
                  <button onClick={() => { setSelectedCake(null); navigateTo('gallery'); }} className="hover:text-lux-gold transition-colors cursor-pointer text-left font-sans">
                    Gourmet Treats
                  </button>
                </li>
                <li>
                  <button onClick={() => { setSelectedCake(null); navigateTo('gallery'); }} className="hover:text-lux-gold transition-colors cursor-pointer text-left font-sans">
                    Fairytale Kids Bakes
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Lower Legal Frame */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-stone-500 font-light font-sans">
            <div>
              <p>© {new Date().getFullYear()} Flavour Bites. Handcrafted in Addis Ababa, Ethiopia. All reserves held.</p>
            </div>
            <div className="flex gap-6">
              <a href="#terms" className="hover:text-white transition-colors">Terms of Commission</a>
              <a href="#privacy" className="hover:text-white transition-colors">Privacy Ordinance</a>
              <a href="#sourcing" className="hover:text-white transition-colors">Ingredient Integrity</a>
            </div>
          </div>
        </footer>
      ) : (
        <footer className="bg-[#111111] text-stone-500 border-t border-stone-900/60 py-6 text-[10px] relative z-10 font-sans">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <p>© {new Date().getFullYear()} Flavour Bites • Master Staff Portal Active • Powered by Neon Postgres Container.</p>
            </div>
            <div className="flex gap-4 font-mono uppercase text-[9px] tracking-widest text-[#c5a880] items-center">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Node Secure</span>
            </div>
          </div>
        </footer>
      )}
      <CakeAssistantBot />
    </div>
  );
}
