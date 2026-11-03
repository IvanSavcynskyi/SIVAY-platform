import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
  translate,
} from './languageUtils.js';

export { LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES };

export const LanguageContext = createContext(null);

export function LanguageProvider({ children, initialLanguage }) {
  const [language, setLanguageState] = useState(() => {
    if (initialLanguage && TRANSLATIONS[initialLanguage]) {
      return initialLanguage;
    }
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (stored && TRANSLATIONS[stored]) {
          return stored;
        }
      }
    } catch {
      // Storage access blocked or unavailable
    }
    return 'uk';
  });

  const setLanguage = (nextLang) => {
    if (!TRANSLATIONS[nextLang]) return;
    setLanguageState(nextLang);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLang);
      }
    } catch {
      // Storage failed
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = useMemo(() => {
    return (path, fallback, params) => translate(language, path, fallback, params);
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    [language, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'uk',
      setLanguage: () => {},
      t: (path, fallback, params) => translate('uk', path, fallback, params),
      supportedLanguages: SUPPORTED_LANGUAGES,
    };
  }
  return context;
}
