"use client";

import { useEffect } from "react";
import { useSettings } from "@/lib/SettingsContext";
import { usePathname } from "next/navigation";

const AUTH_ROUTES = ["/login", "/register", "/verify", "/auth/callback", "/login/password"];

export default function ThemeManager() {
  const { settings } = useSettings();
  const pathname = usePathname();

  useEffect(() => {
    // Don't apply theme on auth pages — keep them always dark
    if (AUTH_ROUTES.includes(pathname)) {
      document.body.classList.remove("light");
      return;
    }

    if (settings?.theme === "light") {
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
    }
  }, [settings?.theme, pathname]);

  return null;
}
