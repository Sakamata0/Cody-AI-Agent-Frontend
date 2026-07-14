"use client";

import { useCallback } from "react";
import { t, Locale } from "./i18n";
import { useSettings } from "./SettingsContext";

export function useTranslation() {
  const { settings } = useSettings();
  const locale: Locale = (settings?.language as Locale) || "en";

  const translate = useCallback(
    (key: string) => t(key, locale),
    [locale]
  );

  return { t: translate, locale };
}
