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
  // Common languages - UUIDs for API compatibility
  { id: '550e8400-e29b-41d4-a716-446655440001', code: 'ar', nameEn: 'Arabic', nameAr: 'العربية' },
  { id: '550e8400-e29b-41d4-a716-446655440002', code: 'en', nameEn: 'English', nameAr: 'الإنجليزية' },
  // Other languages
  { id: '550e8400-e29b-41d4-a716-446655440003', code: 'tl', nameEn: 'Filipino', nameAr: 'الفلبينية' },
  { id: '550e8400-e29b-41d4-a716-446655440004', code: 'id', nameEn: 'Indonesian', nameAr: 'الإندونيسية' },
  { id: '550e8400-e29b-41d4-a716-446655440005', code: 'hi', nameEn: 'Hindi', nameAr: 'الهندية' },
  { id: '550e8400-e29b-41d4-a716-446655440006', code: 'si', nameEn: 'Sinhala', nameAr: 'السنهالية' },
  { id: '550e8400-e29b-41d4-a716-446655440007', code: 'ta', nameEn: 'Tamil', nameAr: 'التاميلية' },
  { id: '550e8400-e29b-41d4-a716-446655440008', code: 'ne', nameEn: 'Nepali', nameAr: 'النيبالية' },
  { id: '550e8400-e29b-41d4-a716-446655440009', code: 'my', nameEn: 'Burmese', nameAr: 'البورمية' },
  { id: '550e8400-e29b-41d4-a716-446655440010', code: 'am', nameEn: 'Amharic', nameAr: 'الأمهرية' },
  { id: '550e8400-e29b-41d4-a716-446655440011', code: 'sw', nameEn: 'Swahili', nameAr: 'السواحيلية' },
  { id: '550e8400-e29b-41d4-a716-446655440012', code: 'ak', nameEn: 'Akan', nameAr: 'الأكانية' },
  { id: '550e8400-e29b-41d4-a716-446655440013', code: 'kri', nameEn: 'Krio', nameAr: 'الكريو' },
] as const;

export const COMMON_LANGUAGE_CODES = ['ar', 'en'];

export function getCommonLanguages(): Language[] {
  return LANGUAGES.filter((l) => COMMON_LANGUAGE_CODES.includes(l.code));
}

export function getOtherLanguages(): Language[] {
  return LANGUAGES.filter((l) => !COMMON_LANGUAGE_CODES.includes(l.code));
}
