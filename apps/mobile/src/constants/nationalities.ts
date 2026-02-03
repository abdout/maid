/**
 * Hardcoded list of 12 nationalities for maid CV and search filters
 * As specified in client feedback document (tadbeer app.xlsx)
 *
 * This replaces the dynamic `useNationalities()` hook for the initial app version.
 * The 12 nationalities are the most common source countries for domestic workers in UAE.
 */

export interface Nationality {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  flag?: string;
}

export const NATIONALITIES: Readonly<Nationality[]> = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    code: 'ID',
    nameEn: 'Indonesia',
    nameAr: 'إندونيسيا',
    flag: '🇮🇩',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    code: 'PH',
    nameEn: 'Philippines',
    nameAr: 'الفلبين',
    flag: '🇵🇭',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    code: 'LK',
    nameEn: 'Sri Lanka',
    nameAr: 'سريلانكا',
    flag: '🇱🇰',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    code: 'IN',
    nameEn: 'India',
    nameAr: 'الهند',
    flag: '🇮🇳',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    code: 'ET',
    nameEn: 'Ethiopia',
    nameAr: 'إثيوبيا',
    flag: '🇪🇹',
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    code: 'MM',
    nameEn: 'Myanmar',
    nameAr: 'ميانمار',
    flag: '🇲🇲',
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    code: 'NP',
    nameEn: 'Nepal',
    nameAr: 'نيبال',
    flag: '🇳🇵',
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    code: 'UG',
    nameEn: 'Uganda',
    nameAr: 'أوغندا',
    flag: '🇺🇬',
  },
  {
    id: '00000000-0000-0000-0000-000000000009',
    code: 'KE',
    nameEn: 'Kenya',
    nameAr: 'كينيا',
    flag: '🇰🇪',
  },
  {
    id: '00000000-0000-0000-0000-000000000010',
    code: 'TZ',
    nameEn: 'Tanzania',
    nameAr: 'تنزانيا',
    flag: '🇹🇿',
  },
  {
    id: '00000000-0000-0000-0000-000000000011',
    code: 'GH',
    nameEn: 'Ghana',
    nameAr: 'غانا',
    flag: '🇬🇭',
  },
  {
    id: '00000000-0000-0000-0000-000000000012',
    code: 'SL',
    nameEn: 'Sierra Leone',
    nameAr: 'سيراليون',
    flag: '🇸🇱',
  },
] as const;

/**
 * Get nationality by ID
 */
export function getNationalityById(id: string): Nationality | undefined {
  return NATIONALITIES.find((n) => n.id === id);
}

/**
 * Get nationality name in the specified language
 */
export function getNationalityName(id: string, isArabic: boolean): string {
  const nationality = getNationalityById(id);
  if (!nationality) return '';
  return isArabic ? nationality.nameAr : nationality.nameEn;
}

/**
 * Get all nationality options for dropdowns/filters
 * @param isArabic - Whether to use Arabic names
 * @returns Array of { value, label } objects
 */
export function getNationalityOptions(isArabic: boolean): Array<{ value: string; label: string }> {
  return NATIONALITIES.map((n) => ({
    value: n.id,
    label: isArabic ? n.nameAr : n.nameEn,
  }));
}
