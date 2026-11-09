'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { vi, type Dictionary } from './locales/vi';
import { en } from './locales/en';

export type Locale = 'vi' | 'en';

interface I18nContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (path: string) => string;
  dictionary: Dictionary;
}

const LOCALE_STORAGE_KEY = 'dtu_upcycled_locale_v1';

const DICTIONARIES: Record<Locale, Dictionary> = {
  vi,
  en,
};

function resolvePath(obj: unknown, path: string): string {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur && typeof cur === 'object' && part in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[part];
    } else {
      return path;
    }
  }
  return typeof cur === 'string' ? cur : path;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'vi',
  setLocale: () => {},
  t: (path: string) => resolvePath(vi, path),
  dictionary: vi,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('vi');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved === 'vi' || saved === 'en') {
        setLocaleState(saved);
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // Ignore storage error
    }
  }, []);

  const dictionary = DICTIONARIES[locale] || vi;

  const t = useCallback(
    (path: string): string => {
      return resolvePath(dictionary, path);
    },
    [dictionary]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      dictionary,
    }),
    [locale, setLocale, t, dictionary]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
