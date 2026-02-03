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

/**
 * UAE Emirate bounding boxes for coordinate-based detection
 * Coordinates: [minLng, minLat, maxLng, maxLat]
 */
export interface EmirateBounds {
  id: string;
  bounds: [number, number, number, number];
  center: [number, number]; // [lng, lat]
}

export const EMIRATE_BOUNDS: Readonly<EmirateBounds[]> = [
  {
    id: 'dubai',
    bounds: [54.89, 24.79, 55.56, 25.36],
    center: [55.27, 25.20],
  },
  {
    id: 'abu_dhabi',
    bounds: [51.58, 22.62, 56.04, 24.98],
    center: [54.37, 24.45],
  },
  {
    id: 'sharjah',
    bounds: [55.33, 24.92, 56.39, 25.93],
    center: [55.47, 25.35],
  },
  {
    id: 'ajman',
    bounds: [55.43, 25.39, 55.52, 25.50],
    center: [55.47, 25.41],
  },
  {
    id: 'ras_al_khaimah',
    bounds: [55.73, 25.52, 56.26, 26.07],
    center: [55.98, 25.79],
  },
  {
    id: 'fujairah',
    bounds: [56.11, 25.03, 56.40, 25.60],
    center: [56.34, 25.12],
  },
  {
    id: 'umm_al_quwain',
    bounds: [55.55, 25.43, 55.78, 25.60],
    center: [55.55, 25.56],
  },
] as const;

// UAE overall bounds for map initial region
export const UAE_BOUNDS: [number, number, number, number] = [51.5, 22.5, 56.5, 26.5];
export const UAE_CENTER: [number, number] = [54.0, 24.0];

/**
 * Detect emirate from coordinates using bounding boxes
 * Returns emirate ID or undefined if outside UAE
 */
export function detectEmirateFromCoords(latitude: number, longitude: number): string | undefined {
  for (const emirate of EMIRATE_BOUNDS) {
    const [minLng, minLat, maxLng, maxLat] = emirate.bounds;
    if (longitude >= minLng && longitude <= maxLng && latitude >= minLat && latitude <= maxLat) {
      return emirate.id;
    }
  }
  return undefined;
}

/**
 * Get center coordinates for an emirate
 */
export function getEmirateCenter(emirateId: string): [number, number] | undefined {
  const emirate = EMIRATE_BOUNDS.find((e) => e.id === emirateId);
  return emirate?.center;
}
