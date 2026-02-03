/**
 * Hardcoded list of languages for maid CV
 * Common languages in UAE domestic worker context
 */

export interface Language {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
}

export const LANGUAGES: Readonly<Language[]> = [
  // Common languages
  { id: 'lang-ar', code: 'ar', nameEn: 'Arabic', nameAr: 'العربية' },
  { id: 'lang-en', code: 'en', nameEn: 'English', nameAr: 'الإنجليزية' },
  // Other languages
  { id: 'lang-tl', code: 'tl', nameEn: 'Filipino', nameAr: 'الفلبينية' },
  { id: 'lang-id', code: 'id', nameEn: 'Indonesian', nameAr: 'الإندونيسية' },
  { id: 'lang-hi', code: 'hi', nameEn: 'Hindi', nameAr: 'الهندية' },
  { id: 'lang-si', code: 'si', nameEn: 'Sinhala', nameAr: 'السنهالية' },
  { id: 'lang-ta', code: 'ta', nameEn: 'Tamil', nameAr: 'التاميلية' },
  { id: 'lang-ne', code: 'ne', nameEn: 'Nepali', nameAr: 'النيبالية' },
  { id: 'lang-my', code: 'my', nameEn: 'Burmese', nameAr: 'البورمية' },
  { id: 'lang-am', code: 'am', nameEn: 'Amharic', nameAr: 'الأمهرية' },
  { id: 'lang-sw', code: 'sw', nameEn: 'Swahili', nameAr: 'السواحيلية' },
  { id: 'lang-ak', code: 'ak', nameEn: 'Akan', nameAr: 'الأكانية' },
  { id: 'lang-kri', code: 'kri', nameEn: 'Krio', nameAr: 'الكريو' },
] as const;

export const COMMON_LANGUAGE_CODES = ['ar', 'en'];

export function getCommonLanguages(): Language[] {
  return LANGUAGES.filter((l) => COMMON_LANGUAGE_CODES.includes(l.code));
}

export function getOtherLanguages(): Language[] {
  return LANGUAGES.filter((l) => !COMMON_LANGUAGE_CODES.includes(l.code));
}
