
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AUTH_STORAGE_KEY = 'ticket-downloader-auth';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
}

interface AuthContextType extends AuthState {
  login: (username: string) => void;
  logout: () => void;
  isLoading: boolean;
}

export function useAuth(): AuthContextType {
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false, username: null });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const parsedAuth: AuthState = JSON.parse(storedAuth);
        setAuthState(parsedAuth);
      }
    } catch (error) {
      console.error("Failed to parse auth state from localStorage", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((username: string) => {
    const newState: AuthState = { isAuthenticated: true, username };
    setAuthState(newState);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error("Failed to save auth state to localStorage", error);
    }
  }, []);

  const logout = useCallback(() => {
    const newState: AuthState = { isAuthenticated: false, username: null };
    setAuthState(newState);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to remove auth state from localStorage", error);
    }
    router.push('/login');
  }, [router]);

  return { ...authState, login, logout, isLoading };
}
