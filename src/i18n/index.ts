import { en } from './en';
import { am } from './am';

export type Locale = 'en' | 'am';
export type TranslationDict = typeof en;

const dictionaries: Record<Locale, TranslationDict> = { en, am };

let currentLocale: Locale = 'en';

export function setLocale(locale: Locale) {
  currentLocale = locale;
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
