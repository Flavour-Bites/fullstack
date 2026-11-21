import { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import type { Product, User } from '@shared/types';
import { http } from '@client/lib/http';
import type { Locale } from '@client/i18n/index';
import AnimatedPage from '../components/AnimatedPage';
import AppLoader from '../components/AppLoader';

import HomeView from '../features/core/components/HomeView';
import GalleryView from '../features/gallery/components/GalleryView';
import ProductDetailsPage from '../features/gallery/components/ProductDetailsPage';
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

import { useAuth } from './providers/AuthProvider';
import { useTheme } from './providers/ThemeProvider';
import { useLocale } from './providers/LocaleProvider';
import { useCakeSelection } from './providers/CakeSelectionProvider';
import { useSearchModal } from '../features/search/hooks/useSearchModal';

export default function App() {
  const { currentUser, authChecked, loginUser, updateUser, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { locale, setLocale, toggleLocale } = useLocale();
  const { selectedCake, prefilledCake, selectCake, clearSelectedCake, orderCake, clearPrefilledCake } = useCakeSelection();
  const { searchOpen, openSearch, closeSearch } = useSearchModal();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (currentUser?.language && currentUser.language !== locale) {
      setLocale(currentUser.language as Locale);
    }
  }, [currentUser]);

  const navigateTo = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCommissionCake = (cake: Product) => {
    orderCake(cake);
    navigateTo('/request');
  };

  const handleLogout = () => {
    http.post('/api/auth/logout').catch(() => {});
    logout();
    navigateTo('/');
  };

  const handleAuthSuccess = (user: User) => {
    loginUser(user);
    navigateTo(user.role === 'admin' || user.role === 'staff' ? '/admin' : '/');
  };

  if (!authChecked) {
    return <AppLoader darkMode={darkMode} />;
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
                onToggleDarkMode={toggleDarkMode}
                onToggleLocale={toggleLocale}
                onLogout={handleLogout}
                onSearchOpen={openSearch}
              />
            }>
              <Route path="/" element={<AnimatedPage><HomeView onSelectCake={(cake) => { selectCake(cake); navigateTo('/gallery'); }} /></AnimatedPage>} />
              <Route path="/gallery" element={<AnimatedPage><GalleryView selectedCake={selectedCake} onClearSelectedCake={clearSelectedCake} onSelectCake={selectCake} onCommissionCake={handleCommissionCake} /></AnimatedPage>} />
              <Route path="/gallery/:id" element={<AnimatedPage><ProductDetailsPage /></AnimatedPage>} />
              <Route path="/request" element={<AnimatedPage><ProtectedRoute currentUser={currentUser}><RequestFormView prefilledCake={prefilledCake} onClearPrefilledCake={clearPrefilledCake} currentUser={currentUser!} /></ProtectedRoute></AnimatedPage>} />
              <Route path="/about" element={<AnimatedPage><AboutView /></AnimatedPage>} />
              <Route path="/testimonials" element={<AnimatedPage><TestimonialsView /></AnimatedPage>} />
              <Route path="/help" element={<AnimatedPage><HelpView /></AnimatedPage>} />
              <Route path="/contact" element={<AnimatedPage><ContactView /></AnimatedPage>} />
              <Route path="/profile" element={<AnimatedPage><ProtectedRoute currentUser={currentUser}><ProfileView currentUser={currentUser!} onLogout={handleLogout} onUpdateUser={updateUser} /></ProtectedRoute></AnimatedPage>} />
              <Route path="/orders" element={<AnimatedPage><MyOrdersView currentUser={currentUser!} /></AnimatedPage>} />

              <Route path="/auth" element={
                <AnimatedPage>
                  {currentUser ? (
                    <Navigate to={currentUser.role === 'admin' || currentUser.role === 'staff' ? '/admin' : '/'} replace />
                  ) : (
                    <AuthView onAuthSuccess={handleAuthSuccess} />
                  )}
                </AnimatedPage>
              } />
              <Route path="*" element={<AnimatedPage><NotFoundView /></AnimatedPage>} />
            </Route>

            {/* Admin Layout (Protected Admin Routes) */}
            <Route element={<AdminLayout currentUser={currentUser} />}>
              <Route path="/admin" element={
                <AnimatedPage>
                  <AdminView currentUser={currentUser!} />
                </AnimatedPage>
              } />
            </Route>

          </Routes>
        </AnimatePresence>

        <SearchModal
          isOpen={searchOpen}
          onClose={closeSearch}
          onSelectCake={(cake) => {
            selectCake(cake);
            navigateTo('/gallery');
          }}
        />
      </div>
    </>
  );
}