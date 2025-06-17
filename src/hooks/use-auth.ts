
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AUTH_STORAGE_KEY = 'ticket-downloader-auth';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  mavToken: string | null;
  tokenExpiresAt: number | null; 
}

interface AuthContextType extends AuthState {
  login: (username: string, mavToken: string, tokenExpiresAt: number) => void;
  logout: () => void;
  isLoading: boolean;
}

export function useAuth(): AuthContextType {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    username: null,
    mavToken: null,
    tokenExpiresAt: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const parsedAuth: AuthState = JSON.parse(storedAuth);
        if (parsedAuth.tokenExpiresAt && parsedAuth.tokenExpiresAt * 1000 < Date.now()) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          setAuthState({ isAuthenticated: false, username: null, mavToken: null, tokenExpiresAt: null });
        } else {
          setAuthState(parsedAuth);
        }
      }
    } catch (error) {
      console.error("Failed to parse auth state from localStorage", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((username: string, mavToken: string, tokenExpiresAt: number) => {
    const newState: AuthState = { isAuthenticated: true, username, mavToken, tokenExpiresAt };
    setAuthState(newState);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error("Failed to save auth state to localStorage", error);
    }
  }, []);

  const logout = useCallback(() => {
    const newState: AuthState = { isAuthenticated: false, username: null, mavToken: null, tokenExpiresAt: null };
    setAuthState(newState);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error)
    {
      console.error("Failed to remove auth state from localStorage", error);
    }
    router.push('/login');
  }, [router]);

  return { ...authState, login, logout, isLoading };
}
