'use client';

import { useState, useEffect, useCallback } from 'react';
import { I18nContext, translations, type Locale, type Translations, getDirection } from '@/lib/i18n';

const LOCALE_STORAGE_KEY = 'maid_locale';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (savedLocale && (savedLocale === 'en' || savedLocale === 'ar')) {
      setLocaleState(savedLocale);
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale;
    document.documentElement.dir = getDirection(newLocale);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale;
      document.documentElement.dir = getDirection(locale);
    }
  }, [locale, mounted]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <I18nContext.Provider
        value={{
          locale: 'en',
          setLocale: () => {},
          t: translations.en as Translations,
          dir: 'ltr',
        }}
      >
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t: translations[locale] as Translations,
        dir: getDirection(locale),
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}
