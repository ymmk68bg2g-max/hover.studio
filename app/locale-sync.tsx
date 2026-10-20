"use client";

import { useEffect } from "react";

export function LocaleSync({ locale }: { locale: "ua" | "en" }) {
  useEffect(() => {
    document.documentElement.lang = locale === "ua" ? "uk" : "en";
    document.cookie = `hover_locale=${locale}; path=/; max-age=31536000; samesite=lax`;
    try { localStorage.setItem("hover_locale", locale); } catch { /* Storage is optional. */ }
  }, [locale]);

  return null;
}
