import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CakeAssistantBot from '../features/chatbot/components/CakeAssistantBot';
import ErrorBoundary from './ErrorBoundary';
import type { Locale } from '@client/i18n/index';
import type { User } from '../../types';

interface CustomerLayoutProps {
  currentUser: User | null;
  darkMode: boolean;
  locale: Locale;
  onToggleDarkMode: () => void;
  onToggleLocale: () => void;
  onLogout: () => void;
  onSearchOpen: () => void;
}

export default function CustomerLayout({
  currentUser,
  darkMode,
  locale,
  onToggleDarkMode,
  onToggleLocale,
  onLogout,
  onSearchOpen,
}: Readonly<CustomerLayoutProps>) {
  return (
    <>
      <Header
        currentUser={currentUser}
        darkMode={darkMode}
        locale={locale}
        onToggleDarkMode={onToggleDarkMode}
        onToggleLocale={onToggleLocale}
        onLogout={onLogout}
        onSearchOpen={onSearchOpen}
      />
      <main id="main-content" className="flex-grow">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
      <ErrorBoundary>
        <CakeAssistantBot />
      </ErrorBoundary>
    </>
  );
}
