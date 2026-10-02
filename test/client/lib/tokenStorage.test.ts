// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { getToken, setToken, clearToken } from '@client/lib/tokenStorage';

describe('tokenStorage', () => {
  beforeEach(() => {
    clearToken();
    localStorage.clear();
  });

  it('initially returns null when no token is saved', () => {
    expect(getToken()).toBeNull();
  });

  it('persists and retrieves tokens from in-memory cache and localStorage', () => {
    setToken('jwt-access-token-xyz');
    expect(getToken()).toBe('jwt-access-token-xyz');
    expect(localStorage.getItem('flavourbites_token')).toBe('jwt-access-token-xyz');
  });

  it('clears token from in-memory cache and localStorage', () => {
    setToken('temporary-token');
    expect(getToken()).toBe('temporary-token');

    clearToken();
    expect(getToken()).toBeNull();
    expect(localStorage.getItem('flavourbites_token')).toBeNull();
  });
});
