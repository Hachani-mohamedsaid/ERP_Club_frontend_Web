import { createContext, useContext, useState, useCallback } from "react";
import { joueurTranslations, type Locale, type JoueurTranslations } from "../i18n/joueurTranslations";

/* eslint-disable react-refresh/only-export-components */

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: JoueurTranslations;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

function getInitialLocale(): Locale {
  try {
    const stored = localStorage.getItem("odin_locale");
    if (stored === "en" || stored === "fr") return stored;
  } catch { /* ignore */ }
  return "fr";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem("odin_locale", next);
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
