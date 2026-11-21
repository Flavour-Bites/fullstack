import { createContext, useContext, useEffect, useState, useMemo, useCallback, ReactNode } from 'react';
import { User } from '@shared/types';
import { http } from '@client/lib/http';
import { setToken, clearToken } from '@client/lib/tokenStorage';
import type { ApiResponse } from '@/shared/api';

interface AuthContextValue {
  currentUser: User | null;
  authChecked: boolean;
  loginUser: (user: User) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

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

  const loginUser = useCallback((user: User) => {
    setCurrentUser(user);
    localStorage.setItem('flavourbites_user', JSON.stringify(user));
  }, []);

  const updateUser = useCallback((user: User) => {
    setCurrentUser(user);
    localStorage.setItem('flavourbites_user', JSON.stringify(user));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('flavourbites_user');
    clearToken();
    setCurrentUser(null);
  }, []);

  const value = useMemo(
    () => ({ currentUser, authChecked, loginUser, updateUser, logout }),
    [currentUser, authChecked, loginUser, updateUser, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}