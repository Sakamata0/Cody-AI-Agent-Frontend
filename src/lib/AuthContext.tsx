"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { User } from "./types";
import { api } from "./api";

// --- Interfaces ---

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// --- Token Helpers ---

function clearStoredTokens(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("id_token");
  localStorage.removeItem("refresh_token");
}

function decodeTokenPayload(token: string): { sub?: string; email?: string; exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
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

  // On mount: restore session from localStorage
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    const idToken = localStorage.getItem("id_token");

    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    const idPayload = idToken ? decodeTokenPayload(idToken) : null;
    const accessPayload = decodeTokenPayload(accessToken);

    const sub = accessPayload?.sub || idPayload?.sub;
    const email = idPayload?.email || accessPayload?.email || "";

    if (!sub) {
      clearStoredTokens();
      setIsLoading(false);
      return;
    }

    setUser({ user_id: sub, email });
    setIsAuthenticated(true);
    setIsLoading(false);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await api.logout();
    } catch {
      // Clear local state even if API fails
    }
    clearStoredTokens();
    setUser(null);
    setIsAuthenticated(false);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, logout }}>
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
