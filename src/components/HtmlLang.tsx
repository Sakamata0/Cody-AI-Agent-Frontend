"use client";

import { useEffect } from "react";
import { useSettings } from "@/lib/SettingsContext";

export default function HtmlLang() {
  const { settings } = useSettings();

  useEffect(() => {
    if (settings?.language) {
      document.documentElement.lang = settings.language;
    }
  }, [settings?.language]);

  return null;
}
