import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PageType, CakeGalleryItem, User } from './types';
import { clearToken } from './shared/utils/apiClient';
import ErrorBoundary from './components/ErrorBoundary';

import HomeView from './components/HomeView';
import GalleryView from './components/GalleryView';
import RequestFormView from './components/RequestFormView';
import AboutView from './components/AboutView';
import TestimonialsView from './components/TestimonialsView';
import ContactView from './components/ContactView';
import CakeAssistantBot from './components/CakeAssistantBot';
import ProfileView from './components/ProfileView';
import AdminView from './components/AdminView';
import { AuthView } from './components/AuthView';
import Header from './components/Header';
import Footer from './components/Footer';
import NotFoundView from './components/NotFoundView';
import SearchModal from './components/SearchModal';

import { setLocale, getLocale } from './i18n';
import type { Locale } from './i18n';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activePage, setActivePage] = useState<PageType>('home');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'orders' | 'menu' | 'categories' | 'reviews' | 'users' | 'recovery'>('dashboard');
  const [locale, setLocaleState] = useState<Locale>(() => getLocale());
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem('theme') === 'dark');
  const [selectedCake, setSelectedCake] = useState<CakeGalleryItem | null>(null);
  const [prefilledCake, setPrefilledCake] = useState<CakeGalleryItem | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(data => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('flavourbites_user', JSON.stringify(data.user));
        } else {
          setCurrentUser(null);
          localStorage.removeItem('flavourbites_user');
        }
      })
      .catch(() => {
        setCurrentUser(null);
        localStorage.removeItem('flavourbites_user');
      })
      .finally(() => setAuthChecked(true));
  }, []);

  const navigateTo = (page: PageType) => {
    let targetPage = page;
    if (page === 'orders') targetPage = 'profile';
    setActivePage(targetPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCommissionCake = (cake: CakeGalleryItem) => {
    setPrefilledCake(cake);
    setSelectedCake(null);
    navigateTo('request');
  };

  const handleLogout = () => {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    localStorage.removeItem('flavourbites_user');
    clearToken();
    setCurrentUser(null);
    navigateTo('home');
  };

  const handleToggleLocale = () => {
    const next: Locale = locale === 'en' ? 'am' : 'en';
    setLocaleState(next);
    setLocale(next);
  };

  const isAdminMode = currentUser && (currentUser.role === 'admin' || currentUser.role === 'staff') && activePage === 'admin';

  if (!authChecked) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center ${
        darkMode ? 'bg-[#111111]' : 'bg-lux-cream'
      }`}>
        <div className="h-1 w-full bg-gradient-to-r from-stone-900 via-lux-gold to-stone-900 fixed top-0 left-0 z-[1000]" />
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-sm bg-stone-900 flex items-center justify-center animate-pulse">
            <span className="text-lux-gold font-serif text-lg">F</span>
          </div>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-lux-gold animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-lux-gold animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-lux-gold animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-lux-gold focus:text-stone-950 focus:text-sm focus:font-mono focus:uppercase focus:font-bold focus:rounded-sm focus:outline-none">
        Skip to main content
      </a>
      <div className={`min-h-screen flex flex-col justify-between selection:bg-lux-gold transition-colors duration-300 relative overflow-x-hidden ${
        darkMode ? 'bg-[#111111] text-stone-100' : 'bg-lux-cream text-stone-800'
      }`}>
        <div className="h-1 w-full bg-gradient-to-r from-stone-900 via-lux-gold to-stone-900 fixed top-0 left-0 z-[1000]" />

        <Header
          currentUser={currentUser}
          darkMode={darkMode}
          locale={locale}
          activePage={activePage}
          adminTab={adminTab}
          isAdminMode={isAdminMode}
          onNavigate={navigateTo}
          onAdminTabChange={(tab) => setAdminTab(tab as typeof adminTab)}
          onToggleDarkMode={() => setDarkMode(d => !d)}
          onToggleLocale={handleToggleLocale}
          onLogout={handleLogout}
          onSearchOpen={() => setSearchOpen(true)}
        />

        <main id="main-content" className="flex-grow">
          <ErrorBoundary>
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
                    onClearPrefilledCake={() => setPrefilledCake(null)}
                    currentUser={currentUser}
                  />
                ) : (
                  <AuthView
                    onAuthSuccess={(user) => { setCurrentUser(user); navigateTo('request'); }}
                    title="Sign In to Book a Cake"
                    subtitle="Authenticate to create your custom cake commission and follow its progress."
                  />
                )
              )}
              {activePage === 'about' && <AboutView />}
              {activePage === 'testimonials' && <TestimonialsView />}
              {activePage === 'contact' && <ContactView />}
              {(activePage === 'profile' || activePage === 'orders') && (
                currentUser ? (
                  <ProfileView currentUser={currentUser} onLogout={handleLogout} onNavigate={navigateTo} />
                ) : (
                  <AuthView
                    onAuthSuccess={(user) => { setCurrentUser(user); navigateTo('profile'); }}
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
                    onAuthSuccess={(user) => { setCurrentUser(user); navigateTo(user.role === 'admin' || user.role === 'staff' ? 'admin' : 'home'); }}
                    title="Yodit's Direct Control Board"
                    subtitle="Access restricted to Flavour Bites staff or admin. Enter authorized credentials."
                  />
                )
              )}
              {activePage === 'auth' && (
                <AuthView
                  onAuthSuccess={(user) => { setCurrentUser(user); navigateTo(user.role === 'admin' || user.role === 'staff' ? 'admin' : 'home'); }}
                />
              )}
              {activePage === 'not-found' && <NotFoundView onNavigate={navigateTo} />}
            </motion.div>
          </AnimatePresence>
          </ErrorBoundary>
        </main>

        <Footer isAdminMode={isAdminMode} onNavigate={navigateTo} />
        <ErrorBoundary><CakeAssistantBot activePage={activePage} /></ErrorBoundary>
        <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} onNavigate={navigateTo} />
      </div>
    </>
  );
}
