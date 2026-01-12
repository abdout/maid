/**
 * UAE Emirates list for office location selection
 * As specified in client feedback document
 */

export interface Emirate {
  id: string;
  nameEn: string;
  nameAr: string;
}

export const EMIRATES: Readonly<Emirate[]> = [
  {
    id: 'abu_dhabi',
    nameEn: 'Abu Dhabi',
    nameAr: 'أبوظبي',
  },
  {
    id: 'dubai',
    nameEn: 'Dubai',
    nameAr: 'دبي',
  },
  {
    id: 'sharjah',
    nameEn: 'Sharjah',
    nameAr: 'الشارقة',
  },
  {
    id: 'ajman',
    nameEn: 'Ajman',
    nameAr: 'عجمان',
  },
  {
    id: 'umm_al_quwain',
    nameEn: 'Umm Al Quwain',
    nameAr: 'أم القيوين',
  },
  {
    id: 'ras_al_khaimah',
    nameEn: 'Ras Al Khaimah',
    nameAr: 'رأس الخيمة',
  },
  {
    id: 'fujairah',
    nameEn: 'Fujairah',
    nameAr: 'الفجيرة',
  },
  {
    id: 'al_ain',
    nameEn: 'Al Ain',
    nameAr: 'العين',
  },
  {
    id: 'khorfakkan_kalba',
    nameEn: 'Khorfakkan & Kalba',
    nameAr: 'خورفكان وكلباء',
  },
] as const;

/**
 * Get emirate by ID
 */
export function getEmirateById(id: string): Emirate | undefined {
  return EMIRATES.find((e) => e.id === id);
}

/**
 * Get emirate name in the specified language
 */
export function getEmirateName(id: string, isArabic: boolean): string {
  const emirate = getEmirateById(id);
  if (!emirate) return '';
  return isArabic ? emirate.nameAr : emirate.nameEn;
}

/**
 * Get all emirate options for dropdowns
 */
export function getEmirateOptions(isArabic: boolean): Array<{ value: string; label: string }> {
  return EMIRATES.map((e) => ({
    value: e.id,
    label: isArabic ? e.nameAr : e.nameEn,
  }));
}
