import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { joueurTranslations, type Locale, type JoueurTranslations } from "../i18n/joueurTranslations";

/* eslint-disable react-refresh/only-export-components */

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: JoueurTranslations;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

const LOCALES: Locale[] = ["fr", "en", "ar"];

function getInitialLocale(): Locale {
  try {
    const stored = localStorage.getItem("odin_locale");
    if (stored && LOCALES.includes(stored as Locale)) return stored as Locale;
  } catch {
    /* ignore */
  }
  return "fr";
}

/** Keep app chrome LTR so calendars/layout stay stable; only text is translated. */
function applyDocumentLocale(locale: Locale) {
  document.documentElement.lang = locale === "ar" ? "ar" : locale;
  document.documentElement.dir = "ltr";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem("odin_locale", next);
    applyDocumentLocale(next);
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: joueurTranslations[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
