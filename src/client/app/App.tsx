import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { CakeGalleryItem, User } from '../../types';
import { http, type ApiResponse } from '@/shared/api';
import { setToken, clearToken } from '@/shared/auth';
import AnimatedPage from '../components/AnimatedPage';

import HomeView from '../features/core/components/HomeView';
import GalleryView from '../features/gallery/components/GalleryView';
import RequestFormView from '../features/orders/components/RequestFormView';
import AboutView from '../features/core/components/AboutView';
import TestimonialsView from '../features/core/components/TestimonialsView';
import ContactView from '../features/contact/components/ContactView';
import ProfileView from '../features/users/components/ProfileView';
import MyOrdersView from '../features/orders/components/MyOrdersView';
import AdminView from '../features/admin/components/AdminView';
import { AuthView } from '../features/auth/components/AuthView';
import { ProtectedRoute } from '../components/ProtectedRoute';
import NotFoundView from '../components/NotFoundView';
import SearchModal from '../features/search/components/SearchModal';
import HelpView from '../features/core/components/HelpView';

import CustomerLayout from '../components/CustomerLayout';
import AdminLayout from '../components/AdminLayout';

import { setLocale as setI18nLocale, getLocale } from '@client/i18n/index';
import type { Locale } from '@client/i18n/index';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [adminTab, setAdminTab] = useState<'dashboard' | 'orders' | 'menu' | 'categories' | 'reviews' | 'users' | 'recovery'>('dashboard');
  const [locale, setLocale] = useState<Locale>(() => getLocale());
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
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenParam = urlParams.get('token');
      if (tokenParam) {
        setToken(tokenParam);
        urlParams.delete('token');
        const newSearch = urlParams.toString();
        const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
        window.history.replaceState({}, '', newUrl);
      }
    } catch {
      // Ignore if URLSearchParams is unavailable
    }

    http.get<ApiResponse<{ user: User }>>('/api/auth/me')
      .then(({ data }) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('flavourbites_user', JSON.stringify(data.user));
          
          if (data.user.language && data.user.language !== locale) {
            const userLocale = data.user.language as Locale;
            setLocale(userLocale);
            setI18nLocale(userLocale);
          }
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

  const handleUpdateUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('flavourbites_user', JSON.stringify(user));
    
    if (user.language && user.language !== locale) {
      const userLocale = user.language as Locale;
      setLocale(userLocale);
      setI18nLocale(userLocale);
    }
  };

  const navigateTo = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCommissionCake = (cake: CakeGalleryItem) => {
    setPrefilledCake(cake);
    setSelectedCake(null);
    navigateTo('/request');
  };

  const handleLogout = () => {
    http.post('/api/auth/logout').catch(() => {});
    localStorage.removeItem('flavourbites_user');
    clearToken();
    setCurrentUser(null);
    navigateTo('/');
  };

  const handleToggleLocale = () => {
    const next: Locale = locale === 'en' ? 'am' : 'en';
    setLocale(next);
    setI18nLocale(next);
  };

  if (!authChecked) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center ${
        darkMode ? 'bg-stone-950' : 'bg-lux-cream'
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
        darkMode ? 'bg-stone-950 text-stone-100' : 'bg-lux-cream text-stone-800'
      }`}>
        <div className="h-1 w-full bg-gradient-to-r from-stone-900 via-lux-gold to-stone-900 fixed top-0 left-0 z-[1000]" />

        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            
            {/* Customer Layout (Public & Protected Customer Routes) */}
            <Route element={
              <CustomerLayout
                currentUser={currentUser}
                darkMode={darkMode}
                locale={locale}
                onToggleDarkMode={() => setDarkMode(d => !d)}
                onToggleLocale={handleToggleLocale}
                onLogout={handleLogout}
                onSearchOpen={() => setSearchOpen(true)}
              />
            }>
              <Route path="/" element={<AnimatedPage><HomeView onSelectCake={(cake) => { setSelectedCake(cake); navigateTo('/gallery'); }} /></AnimatedPage>} />
              <Route path="/gallery" element={<AnimatedPage><GalleryView selectedCake={selectedCake} onClearSelectedCake={() => setSelectedCake(null)} onSelectCake={setSelectedCake} onCommissionCake={handleCommissionCake} /></AnimatedPage>} />
              <Route path="/request" element={<AnimatedPage><ProtectedRoute currentUser={currentUser}><RequestFormView prefilledCake={prefilledCake} onClearPrefilledCake={() => setPrefilledCake(null)} currentUser={currentUser!} /></ProtectedRoute></AnimatedPage>} />
              <Route path="/about" element={<AnimatedPage><AboutView /></AnimatedPage>} />
              <Route path="/testimonials" element={<AnimatedPage><TestimonialsView /></AnimatedPage>} />
              <Route path="/help" element={<AnimatedPage><HelpView /></AnimatedPage>} />
              <Route path="/contact" element={<AnimatedPage><ContactView /></AnimatedPage>} />
              <Route path="/profile" element={<AnimatedPage><ProtectedRoute currentUser={currentUser}><ProfileView currentUser={currentUser!} onLogout={handleLogout} onUpdateUser={handleUpdateUser} /></ProtectedRoute></AnimatedPage>} />
              <Route path="/orders" element={<AnimatedPage><MyOrdersView currentUser={currentUser!} /></AnimatedPage>} />
              
              <Route path="/auth" element={
                <AnimatedPage>
                  {currentUser ? (
                    <Navigate to={currentUser.role === 'admin' || currentUser.role === 'staff' ? '/admin' : '/'} replace />
                  ) : (
                    <AuthView onAuthSuccess={(user) => { setCurrentUser(user); navigateTo(user.role === 'admin' || user.role === 'staff' ? '/admin' : '/'); }} />
                  )}
                </AnimatedPage>
              } />
              <Route path="*" element={<AnimatedPage><NotFoundView /></AnimatedPage>} />
            </Route>

            {/* Admin Layout (Protected Admin Routes) */}
            <Route element={<AdminLayout currentUser={currentUser} />}>
              <Route path="/admin" element={
                <AnimatedPage>
                  <AdminView activeTab={adminTab} onTabChange={setAdminTab} currentUser={currentUser!} />
                </AnimatedPage>
              } />
            </Route>
            
          </Routes>
        </AnimatePresence>

        <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>
    </>
  );
}
