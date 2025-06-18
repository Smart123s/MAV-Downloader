
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast'; // Import useToast

const AUTH_STORAGE_KEY = 'ticket-downloader-auth';
const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes in milliseconds
const TOKEN_CHECK_INTERVAL_MS = 1 * 60 * 1000; // 1 minute in milliseconds

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  password?: string | null; // Store password if rememberMe is true
  mavToken: string | null;
  tokenExpiresAt: number | null; // Unix timestamp in seconds
  rememberMe: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, mavToken: string, tokenExpiresAt: number, rememberMe: boolean, passwordToStore?: string) => void;
  logout: () => void;
  isLoading: boolean;
}

export function useAuth(): AuthContextType {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    username: null,
    password: null,
    mavToken: null,
    tokenExpiresAt: null,
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(true); // Overall loading for auth init and auto-relogin
  const router = useRouter();
  const { toast } = useToast();

  const login = useCallback((
    username: string,
    mavToken: string,
    tokenExpiresAt: number,
    rememberMe: boolean,
    passwordToStore?: string
  ) => {
    const newState: AuthState = {
      isAuthenticated: true,
      username,
      mavToken,
      tokenExpiresAt,
      rememberMe,
      password: rememberMe && passwordToStore ? passwordToStore : null,
    };
    setAuthState(newState);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error("Failed to save auth state to localStorage", error);
    }
  }, []);

  const logout = useCallback(() => {
    const newState: AuthState = {
      isAuthenticated: false,
      username: null,
      password: null,
      mavToken: null,
      tokenExpiresAt: null,
      rememberMe: false,
    };
    setAuthState(newState);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to remove auth state from localStorage", error);
    }
    router.push('/login');
  }, [router]);

  // Effect for initial auth state loading
  useEffect(() => {
    setIsLoading(true);
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const parsedAuth: AuthState = JSON.parse(storedAuth);
        // Check if token is already expired on load
        if (parsedAuth.isAuthenticated && parsedAuth.tokenExpiresAt && parsedAuth.tokenExpiresAt * 1000 < Date.now()) {
          if (!parsedAuth.rememberMe || !parsedAuth.password) { // If not remembering or no password, just logout
            console.log("Token expired on load, logging out.");
            localStorage.removeItem(AUTH_STORAGE_KEY); // Clear invalid stored auth
            setAuthState(prev => ({...prev, isAuthenticated: false, username: null, mavToken: null, tokenExpiresAt: null, password: null, rememberMe: false }));
          } else {
            // If rememberMe is true, the auto-relogin effect will handle it.
            // For now, set the state which might trigger the auto-relogin.
             setAuthState(parsedAuth);
          }
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


  // Effect for automatic re-login
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;

    const attemptAutoRelogin = async () => {
      // Fetch the latest auth state from localStorage to ensure fresh credentials
      const currentStoredAuthString = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!currentStoredAuthString) return;
      const currentStoredAuth: AuthState = JSON.parse(currentStoredAuthString);

      if (
        currentStoredAuth.isAuthenticated &&
        currentStoredAuth.tokenExpiresAt &&
        currentStoredAuth.rememberMe &&
        currentStoredAuth.username &&
        currentStoredAuth.password // Crucially check for stored password
      ) {
        const timeUntilExpiry = (currentStoredAuth.tokenExpiresAt * 1000) - Date.now();

        if (timeUntilExpiry <= 0) {
          console.log("Token expired during check, attempting auto-relogin with stored credentials.");
          // Token is expired, must re-login
        } else if (timeUntilExpiry < TOKEN_REFRESH_THRESHOLD_MS) {
          console.log("Token nearing expiry, attempting auto-relogin.");
          // Token is nearing expiry
        } else {
          // Token is still valid and not nearing expiry, no action needed now
          return;
        }
        
        // Common logic for re-login attempt
        setIsLoading(true);
        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: currentStoredAuth.username,
              password: currentStoredAuth.password,
            }),
          });
          const result = await response.json();

          if (response.ok && result.token) {
            login(result.username, result.token, result.expiresAt, true, currentStoredAuth.password);
            console.log("Auto-relogin successful.");
          } else {
            toast({
              variant: "destructive",
              title: "Automatic Re-login Failed",
              description: result.message || "Could not refresh your session. Please log in again.",
            });
            // Clear sensitive data and effectively log out
            const failedState: AuthState = {
                isAuthenticated: false,
                username: currentStoredAuth.username, // keep username for prefill potentially
                password: null, // CRITICAL: clear password
                mavToken: null,
                tokenExpiresAt: null,
                rememberMe: false, // CRITICAL: turn off remember me
            };
            setAuthState(failedState);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(failedState));
            router.push('/login');
          }
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Auto Re-login Error",
            description: "An error occurred while trying to refresh your session.",
          });
          const errorState: AuthState = {
            isAuthenticated: false,
            username: currentStoredAuth.username,
            password: null,
            mavToken: null,
            tokenExpiresAt: null,
            rememberMe: false,
          };
          setAuthState(errorState);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(errorState));
          router.push('/login');
        } finally {
          setIsLoading(false);
        }
      } else if (currentStoredAuth.isAuthenticated && currentStoredAuth.tokenExpiresAt && (currentStoredAuth.tokenExpiresAt * 1000) - Date.now() <= 0) {
        // Token expired, and no "rememberMe" with password was set up or it failed previously
        console.log("Token expired and no rememberMe active for re-login. Logging out.");
        logout();
      }
    };

    // Perform an initial check if conditions are met
    if (authState.isAuthenticated && authState.rememberMe && authState.password) {
      attemptAutoRelogin(); // Check on mount/auth change if rememberMe is active
      intervalId = setInterval(attemptAutoRelogin, TOKEN_CHECK_INTERVAL_MS);
    } else if (authState.isAuthenticated && authState.tokenExpiresAt && (authState.tokenExpiresAt * 1000) - Date.now() <=0 ) {
      // If authenticated, no remember me, but token is expired -> logout.
      // This case might be hit if initial load had expired token but not rememberMe
      logout();
    }


    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [authState.isAuthenticated, authState.rememberMe, authState.password, authState.tokenExpiresAt, login, logout, router, toast]);


  return { ...authState, login, logout, isLoading };
}
