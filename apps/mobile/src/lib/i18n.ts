import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { Platform, I18nManager } from 'react-native';
import ar from '@/locales/ar.json';
import en from '@/locales/en.json';
import { storage, STORAGE_KEYS } from './storage';

export type SupportedLanguage = 'ar' | 'en';

// Get device language with fallbacks for web
const getDeviceLanguage = (): SupportedLanguage => {
  try {
    // Try expo-localization first
    const locales = getLocales();
    if (locales && locales.length > 0 && locales[0]?.languageCode) {
      const lang = locales[0].languageCode;
      return lang === 'ar' ? 'ar' : 'en';
    }
  } catch {
    // expo-localization might fail on web
  }

  // Fallback for web: check navigator
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    const browserLang = navigator.language?.split('-')[0];
    if (browserLang === 'ar') return 'ar';
  }

  // Default to English
  return 'en';
};

const deviceLanguage = getDeviceLanguage();

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: deviceLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  // Return key if translation is missing (helps debug)
  returnEmptyString: false,
  // Don't show key path as fallback
  keySeparator: '.',
  nsSeparator: ':',
});

/**
 * Initialize language from storage on app start
 * Call this in _layout.tsx useEffect
 * @returns The initialized language
 */
export async function initializeLanguage(): Promise<SupportedLanguage> {
  try {
    const savedLanguage = await storage.getItem(STORAGE_KEYS.LANGUAGE);
    const lang: SupportedLanguage = savedLanguage === 'ar' || savedLanguage === 'en'
      ? savedLanguage
      : getDeviceLanguage();

    // Set i18n language
    if (i18n.language !== lang) {
      await i18n.changeLanguage(lang);
    }

    // Apply RTL settings (this only takes effect on next app start)
    const isRTL = lang === 'ar';
    if (Platform.OS !== 'web') {
      I18nManager.allowRTL(true);
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.forceRTL(isRTL);
      }
    }

    // Save to storage if not already saved
    if (!savedLanguage) {
      await storage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    }

    return lang;
  } catch (error) {
    console.error('[i18n] Failed to initialize language:', error);
    return 'en';
  }
}

/**
 * Change language and handle RTL state
 * @param newLang The language to change to
 * @returns Boolean indicating if app restart is needed (RTL state changed)
 */
export async function changeLanguage(newLang: SupportedLanguage): Promise<boolean> {
  try {
    // Save to storage first
    await storage.setItem(STORAGE_KEYS.LANGUAGE, newLang);

    // Change i18n language (triggers re-render of translated content)
    await i18n.changeLanguage(newLang);

    // Check if RTL state needs to change
    const isRTL = newLang === 'ar';
    const currentRTL = I18nManager.isRTL;

    if (Platform.OS !== 'web' && isRTL !== currentRTL) {
      // RTL state needs to change - requires restart
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(isRTL);
      return true; // Restart needed
    }

    return false; // No restart needed
  } catch (error) {
    console.error('[i18n] Failed to change language:', error);
    return false;
  }
}

/**
 * Handle app restart for RTL changes
 * Uses expo-updates for production (if installed), manual restart prompt for development
 */
export async function handleLanguageRestart(): Promise<void> {
  if (Platform.OS === 'web') {
    // Web doesn't need restart, just reload
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
    return;
  }

  try {
    // Try to use expo-updates if available (production build)
    if (!__DEV__) {
      try {
        const Updates = require('expo-updates');
        if (Updates.reloadAsync) {
          await Updates.reloadAsync();
          return;
        }
      } catch {
        // expo-updates not installed, fall through to manual restart
      }
    }
    // In development or if expo-updates unavailable, the restart alert has already been shown
    // User needs to manually restart the app
  } catch (error) {
    console.error('[i18n] Failed to restart app:', error);
  }
}

/**
 * Check if current language is RTL
 */
export function isRTL(): boolean {
  return i18n.language === 'ar';
}

/**
 * Get current language
 */
export function getCurrentLanguage(): SupportedLanguage {
  return i18n.language === 'ar' ? 'ar' : 'en';
}

export default i18n;
