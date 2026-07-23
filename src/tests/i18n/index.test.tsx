// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { t, setLocale, getLocale } from '@/i18n/index';

beforeEach(() => {
  localStorage.clear();
  setLocale('en');
});

describe('t()', () => {
  it('returns a simple top-level key', () => {
    expect(t('common.save')).toBe('Save');
  });

  it('returns a nested key', () => {
    expect(t('nav.home')).toBe('Home');
  });

  it('returns the path when the key is missing', () => {
    expect(t('nope.nothing')).toBe('nope.nothing');
  });

  it('returns the path when params are given but no interpolation needed', () => {
    expect(t('common.save', { extra: 'x' })).toBe('Save');
  });
});

describe('setLocale / getLocale', () => {
  it('defaults to English', () => {
    expect(getLocale()).toBe('en');
  });

  it('switches to Amharic and reflects in t()', () => {
    setLocale('am');
    expect(getLocale()).toBe('am');
    expect(t('common.save')).toBe('አስቀምጥ');
  });

  it('persists to localStorage', () => {
    setLocale('am');
    expect(localStorage.getItem('flavourbites_locale')).toBe('am');
  });

  it('round-trips en -> am -> en', () => {
    setLocale('am');
    expect(getLocale()).toBe('am');
    setLocale('en');
    expect(getLocale()).toBe('en');
  });
});
