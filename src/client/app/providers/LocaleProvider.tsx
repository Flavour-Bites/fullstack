import { createContext, useContext, useState, ReactNode } from 'react';
import { getLocale, setLocale as setI18nLocale, Locale } from '@client/i18n/index';

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  toggleLocale: () => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getLocale());

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    setI18nLocale(next);
  };

  const toggleLocale = () => setLocale(locale === 'en' ? 'am' : 'en');

  return (
    <LocaleContext.Provider value={{ locale, setLocale, toggleLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within a LocaleProvider');
  return ctx;
}