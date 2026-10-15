'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { TokenStorage, authApi } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  display_name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPage =
    pathname === '/login' ||
    pathname === '/login/' ||
    pathname === '/register' ||
    pathname === '/register/' ||
    pathname === '/forgot-password' ||
    pathname === '/forgot-password/' ||
    pathname?.startsWith('/reset-password');

  const checkAuth = async () => {
    // 1. Intercept Supabase Auth URL callbacks (hash fragment or query)
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';

      // Check if this is a password recovery flow
      const isRecovery =
        hash.includes('type=recovery') ||
        search.includes('type=recovery') ||
        (hash.includes('access_token=') && !TokenStorage.getAccessToken() && !pathname?.startsWith('/reset-password'));

      if (isRecovery && !pathname?.startsWith('/reset-password')) {
        setLoading(false);
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
        window.location.replace(`${window.location.origin}${basePath}/reset-password/${hash}${search}`);
        return;
      }

      // Automatically store token on email confirmation signup callback
      if (hash.includes('type=signup') || hash.includes('type=email_change')) {
        const hashParams = new URLSearchParams(hash.substring(1));
        const token = hashParams.get('access_token');
        if (token) {
          TokenStorage.setAccessToken(token);
        }
      }
    }

    const token = TokenStorage.getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      if (!isPublicPage) {
        router.push('/login');
      }
      return;
    }

    try {
      const me = await authApi.getMe();
      setUser(me);
    } catch {
      TokenStorage.clear();
      setUser(null);
      if (!isPublicPage) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const login = async (email: string, pass: string) => {
    const data = await authApi.login(email, pass);
    setUser(data.user);
    router.push('/');
  };

  const register = async (email: string, pass: string, name: string) => {
    const data = await authApi.register(email, pass, name);
    if (data.user) {
      setUser(data.user);
      router.push('/');
    }
    return data;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
