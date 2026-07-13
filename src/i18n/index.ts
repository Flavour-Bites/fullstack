import { en } from './en';
import { am } from './am';

export type Locale = 'en' | 'am';
export type TranslationDict = typeof en;

const dictionaries: Record<Locale, TranslationDict> = { en, am };

function loadSavedLocale(): Locale {
  try {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('flavourbites_locale') : null;
    if (saved === 'en' || saved === 'am') return saved;
  } catch { /* ignore */ }
  return 'en';
}

let currentLocale: Locale = loadSavedLocale();

export function setLocale(locale: Locale) {
  currentLocale = locale;
  try { localStorage.setItem('flavourbites_locale', locale); } catch { /* ignore */ }
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(path: string, params?: Record<string, string | number>): string {
  const keys = path.split('.');
  let value: any = dictionaries[currentLocale];
  for (const key of keys) {
    if (value == null) return path;
    value = value[key];
  }
  if (typeof value !== 'string') return path;

  if (params) {
    return Object.entries(params).reduce((str, [key, val]) => {
      return str.replace(new RegExp(`\\{${key}\\}`, 'g'), String(val));
    }, value);
  }

  return value;
}

export function useTranslation() {
  return { t, locale: currentLocale, setLocale };
}
