"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { UserSettings, UserSettingsUpdate } from "./types";
import { api } from "./api";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { t, Locale } from "./i18n";

interface SettingsContextType {
  settings: UserSettings | null;
  isLoading: boolean;
  reload: () => Promise<void>;
  update: (changes: UserSettingsUpdate) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch {
      // Silently fail — user may not be authenticated yet
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Optimistic update: apply changes to local state immediately,
  // then persist to server in the background.
  const update = useCallback((changes: UserSettingsUpdate) => {
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ...(changes.display_name !== undefined && { display_name: changes.display_name }),
        ...(changes.avatar_index !== undefined && { avatar_index: changes.avatar_index }),
        ...(changes.theme !== undefined && { theme: changes.theme }),
        ...(changes.language !== undefined && { language: changes.language }),
      };
    });

    // Fire and forget — persist in background
    api.updateSettings(changes)
      .then(() => {
        const locale = (changes.language || settings?.language || "en") as Locale;
        toast(t("toast.settingsSaved", locale), "success");
      })
      .catch(() => {
        const locale = (settings?.language || "en") as Locale;
        toast(t("toast.settingsFailed", locale), "error");
        // Revert to actual server state
        reload();
      });
  }, [reload, toast, settings]);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      reload();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading, reload]);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, reload, update }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return ctx;
}
