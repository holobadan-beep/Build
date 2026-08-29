import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import en from "./en.json";
import id from "./id.json";

// To add a new language: create `xx.json` next to this file with the same
// keys as en.json, then add one entry here. No other source file needs to change.
export const LANGUAGES: Record<string, { label: string; dict: Record<string, string> }> = {
  en: { label: "English", dict: en },
  id: { label: "Indonesia", dict: id }
  // zh, ja, ko, es, fr, de, pt, it, ru, ar, hi, tr can be added the same way.
};

type I18nContextValue = {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string, vars?: Record<string, string>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "codex.language";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || "en";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<I18nContextValue>(() => {
    const dict = LANGUAGES[lang]?.dict || LANGUAGES.en.dict;
    const fallback = LANGUAGES.en.dict;
    return {
      lang,
      setLang: setLangState,
      t: (key: string, vars?: Record<string, string>) => {
        let str = dict[key] ?? fallback[key] ?? key;
        if (vars) {
          for (const [k, v] of Object.entries(vars)) {
            str = str.replace(`{${k}}`, v);
          }
        }
        return str;
      }
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
