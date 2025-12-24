import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { Platform } from 'react-native';
import ar from '@/locales/ar.json';
import en from '@/locales/en.json';

// Get device language with fallbacks for web
const getDeviceLanguage = (): string => {
  try {
    // Try expo-localization first
    const locales = getLocales();
    if (locales && locales.length > 0 && locales[0]?.languageCode) {
      return locales[0].languageCode;
    }
  } catch {
    // expo-localization might fail on web
  }

  // Fallback for web: check navigator
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    const browserLang = navigator.language?.split('-')[0];
    if (browserLang) return browserLang;
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
  lng: deviceLanguage === 'ar' ? 'ar' : 'en',
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

export default i18n;
