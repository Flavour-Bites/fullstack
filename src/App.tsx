import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PageType, CakeGalleryItem, User } from './types';
import { clearToken } from './shared/utils/apiClient';
import ErrorBoundary from './shared/ui/ErrorBoundary';

import HomeView from './features/core/components/HomeView';
import GalleryView from './features/gallery/components/GalleryView';
import RequestFormView from './features/orders/components/RequestFormView';
import AboutView from './features/core/components/AboutView';
import TestimonialsView from './features/core/components/TestimonialsView';
import ContactView from './features/contact/components/ContactView';
import CakeAssistantBot from './features/chatbot/components/CakeAssistantBot';
import ProfileView from './features/users/components/ProfileView';
import MyOrdersView from './features/orders/components/MyOrdersView';
import AdminView from './features/admin/components/AdminView';
import { AuthView } from './features/auth/components/AuthView';
import { ProtectedRoute } from './shared/ui/ProtectedRoute';
import Header from './shared/ui/Header';
import Footer from './shared/ui/Footer';
import NotFoundView from './shared/ui/NotFoundView';
import SearchModal from './features/search/components/SearchModal';

import { setLocale, getLocale } from './i18n';
import type { Locale } from './i18n';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
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

  const getActivePage = (): PageType => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'home';
    if (path === '/gallery') return 'gallery';
    if (path === '/request') return 'request';
    if (path === '/about') return 'about';
    if (path === '/testimonials') return 'testimonials';
    if (path === '/contact') return 'contact';
    if (path === '/profile') return 'profile';
    if (path === '/orders') return 'orders';
    if (path.startsWith('/admin')) return 'admin';
    if (path === '/auth') return 'auth';
    return 'not-found';
  };

  const activePage = getActivePage();

  const navigateTo = (page: PageType) => {
    const routes: Record<PageType, string> = {
      home: '/',
      gallery: '/gallery',
      request: '/request',
      about: '/about',
      testimonials: '/testimonials',
      contact: '/contact',
      profile: '/profile',
      orders: '/orders',
      admin: '/admin',
      auth: '/auth',
      'not-found': '/404'
    };
    navigate(routes[page] || '/');
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
          adminTab={adminTab}
          isAdminMode={isAdminMode}
          onAdminTabChange={(tab) => setAdminTab(tab as typeof adminTab)}
          onToggleDarkMode={() => setDarkMode(d => !d)}
          onToggleLocale={handleToggleLocale}
          onLogout={handleLogout}
          onSearchOpen={() => setSearchOpen(true)}
        />

        <main id="main-content" className="flex-grow">
          <ErrorBoundary>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35, ease: 'easeInOut' }}>
                  <HomeView onSelectCake={(cake) => { setSelectedCake(cake); navigateTo('gallery'); }} />
                </motion.div>
              } />
              
              <Route path="/gallery" element={
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35, ease: 'easeInOut' }}>
                  <GalleryView selectedCake={selectedCake} onClearSelectedCake={() => setSelectedCake(null)} onSelectCake={setSelectedCake} onCommissionCake={handleCommissionCake} />
                </motion.div>
              } />

              <Route path="/request" element={
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35, ease: 'easeInOut' }}>
                  <ProtectedRoute currentUser={currentUser}>
                    <RequestFormView prefilledCake={prefilledCake} onClearPrefilledCake={() => setPrefilledCake(null)} currentUser={currentUser!} />
                  </ProtectedRoute>
                </motion.div>
              } />

              <Route path="/about" element={
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35, ease: 'easeInOut' }}>
                  <AboutView />
                </motion.div>
              } />

              <Route path="/testimonials" element={
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35, ease: 'easeInOut' }}>
                  <TestimonialsView />
                </motion.div>
              } />

              <Route path="/contact" element={
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35, ease: 'easeInOut' }}>
                  <ContactView />
                </motion.div>
              } />

              <Route path="/profile" element={
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35, ease: 'easeInOut' }}>
                  <ProtectedRoute currentUser={currentUser}>
                    <ProfileView currentUser={currentUser!} onLogout={handleLogout} />
                  </ProtectedRoute>
                </motion.div>
              } />

              <Route path="/orders" element={
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35, ease: 'easeInOut' }}>
                  <ProtectedRoute currentUser={currentUser}>
                    <MyOrdersView currentUser={currentUser!} />
                  </ProtectedRoute>
                </motion.div>
              } />

              <Route path="/admin" element={
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35, ease: 'easeInOut' }}>
                  <ProtectedRoute currentUser={currentUser} requireAdmin>
                    <AdminView activeTab={adminTab} onTabChange={setAdminTab} currentUser={currentUser!} />
                  </ProtectedRoute>
                </motion.div>
              } />

              <Route path="/auth" element={
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35, ease: 'easeInOut' }}>
                  {currentUser ? (
                    <Navigate to={currentUser.role === 'admin' || currentUser.role === 'staff' ? '/admin' : '/'} replace />
                  ) : (
                    <AuthView onAuthSuccess={(user) => { setCurrentUser(user); navigateTo(user.role === 'admin' || user.role === 'staff' ? 'admin' : 'home'); }} />
                  )}
                </motion.div>
              } />

              <Route path="*" element={
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35, ease: 'easeInOut' }}>
                  <NotFoundView />
                </motion.div>
              } />
            </Routes>
          </AnimatePresence>
          </ErrorBoundary>
        </main>

        <Footer isAdminMode={isAdminMode} />
        <ErrorBoundary><CakeAssistantBot activePage={activePage} /></ErrorBoundary>
        <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>
    </>
  );
}
