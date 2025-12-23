import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import ar from '@/locales/ar.json';
import en from '@/locales/en.json';

const deviceLanguage = getLocales()[0]?.languageCode || 'ar';

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
});

export default i18n;
