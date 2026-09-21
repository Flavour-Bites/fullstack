import { ReactNode } from 'react';
import { ThemeProvider } from './ThemeProvider';
import { LocaleProvider } from './LocaleProvider';
import { AuthProvider } from './AuthProvider';
import { CakeSelectionProvider } from './CakeSelectionProvider';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <AuthProvider>
          <CakeSelectionProvider>{children}</CakeSelectionProvider>
        </AuthProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}