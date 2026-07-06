"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { User, TokenResponse } from "./types";
import { api } from "./api";

// --- Interfaces ---

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<{ needsVerification: boolean }>;
  verify: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// --- Token Helpers ---

function storeTokens(tokenResponse: TokenResponse): void {
  localStorage.setItem("access_token", tokenResponse.access_token);
  localStorage.setItem("id_token", tokenResponse.id_token);
  if (tokenResponse.refresh_token) {
    localStorage.setItem("refresh_token", tokenResponse.refresh_token);
  }
}

function clearStoredTokens(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("id_token");
  localStorage.removeItem("refresh_token");
}

/**
 * Decode a JWT payload (base64url) to extract user info.
 * Does NOT validate signature — only used to read claims from a stored token.
 */
function decodeTokenPayload(token: string): { sub?: string; email?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    // base64url → base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// --- AuthProvider Component ---

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: check localStorage for existing tokens and restore session
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
      const payload = decodeTokenPayload(accessToken);
      if (payload && payload.sub && payload.email) {
        setUser({ user_id: payload.sub, email: payload.email });
        setIsAuthenticated(true);
      } else {
        // Token is malformed, clear it
        clearStoredTokens();
      }
    }

    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const tokenResponse = await api.login(email, password);
    storeTokens(tokenResponse);
    setUser(tokenResponse.user);
    setIsAuthenticated(true);
  }, []);

  const register = useCallback(async (email: string, password: string): Promise<{ needsVerification: boolean }> => {
    await api.register(email, password);
    return { needsVerification: true };
  }, []);

  const verify = useCallback(async (email: string, code: string): Promise<void> => {
    await api.verify(email, code);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await api.logout();
    } catch {
      // Even if the API call fails, clear local state
    }
    clearStoredTokens();
    setUser(null);
    setIsAuthenticated(false);
    router.push("/login");
  }, [router]);

  const refreshToken = useCallback(async (): Promise<void> => {
    const storedRefreshToken = localStorage.getItem("refresh_token");
    if (!storedRefreshToken) {
      throw new Error("No refresh token available");
    }

    const tokenResponse = await api.refresh(storedRefreshToken);
    storeTokens(tokenResponse);

    if (tokenResponse.user) {
      setUser(tokenResponse.user);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        verify,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// --- Custom Hook ---

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
