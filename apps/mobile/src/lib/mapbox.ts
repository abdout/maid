import Constants from 'expo-constants';
import { detectEmirateFromCoords } from '@/constants/emirates';

const MAPBOX_ACCESS_TOKEN = Constants.expoConfig?.extra?.mapboxAccessToken || '';

export interface MapboxFeature {
  id: string;
  place_name: string;
  place_name_ar?: string;
  center: [number, number]; // [lng, lat]
  context?: Array<{
    id: string;
    text: string;
    text_ar?: string;
  }>;
  properties?: {
    address?: string;
  };
}

export interface MapboxSearchResult {
  features: MapboxFeature[];
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  addressAr: string;
  emirate: string;
  googleMapsUrl: string;
}

/**
 * Forward geocoding - search for places by text
 * Limited to UAE (country=ae)
 */
export async function searchPlaces(query: string, limit = 5): Promise<MapboxFeature[]> {
  if (!query.trim() || !MAPBOX_ACCESS_TOKEN) {
    return [];
  }

  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?` +
      `access_token=${MAPBOX_ACCESS_TOKEN}` +
      `&country=ae` +
      `&limit=${limit}` +
      `&language=en,ar` +
      `&types=address,poi,place,locality,neighborhood`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Mapbox search failed:', response.status);
      return [];
    }

    const data: MapboxSearchResult = await response.json();
    return data.features || [];
  } catch (error) {
    console.error('Mapbox search error:', error);
    return [];
  }
}

/**
 * Reverse geocoding - get address from coordinates
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<LocationData | null> {
  if (!MAPBOX_ACCESS_TOKEN) {
    // Fallback when no token - use coordinates as address
    const emirate = detectEmirateFromCoords(latitude, longitude);
    return {
      latitude,
      longitude,
      address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      addressAr: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      emirate: emirate || '',
      googleMapsUrl: generateGoogleMapsUrl(latitude, longitude),
    };
  }

  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?` +
      `access_token=${MAPBOX_ACCESS_TOKEN}` +
      `&language=en,ar` +
      `&types=address,poi,place,locality,neighborhood,region`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Mapbox reverse geocode failed:', response.status);
      return null;
    }

    const data: MapboxSearchResult = await response.json();
    const feature = data.features?.[0];

    if (!feature) {
      // No result - use coordinates
      const emirate = detectEmirateFromCoords(latitude, longitude);
      return {
        latitude,
        longitude,
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        addressAr: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        emirate: emirate || '',
        googleMapsUrl: generateGoogleMapsUrl(latitude, longitude),
      };
    }

    // Extract emirate from context
    let emirate = '';
    const regionContext = feature.context?.find((c) => c.id.startsWith('region'));
    if (regionContext) {
      emirate = normalizeEmirateFromMapbox(regionContext.text);
    }

    // Fallback to coordinate-based detection
    if (!emirate) {
      emirate = detectEmirateFromCoords(latitude, longitude) || '';
    }

    // Get Arabic address if available
    const addressAr = feature.place_name_ar || feature.place_name;

    return {
      latitude,
      longitude,
      address: feature.place_name,
      addressAr,
      emirate,
      googleMapsUrl: generateGoogleMapsUrl(latitude, longitude),
    };
  } catch (error) {
    console.error('Mapbox reverse geocode error:', error);
    return null;
  }
}

/**
 * Convert a Mapbox feature to LocationData
 */
export function featureToLocationData(feature: MapboxFeature): LocationData {
  const [longitude, latitude] = feature.center;

  // Extract emirate from context
  let emirate = '';
  const regionContext = feature.context?.find((c) => c.id.startsWith('region'));
  if (regionContext) {
    emirate = normalizeEmirateFromMapbox(regionContext.text);
  }

  // Fallback to coordinate-based detection
  if (!emirate) {
    emirate = detectEmirateFromCoords(latitude, longitude) || '';
  }

  return {
    latitude,
    longitude,
    address: feature.place_name,
    addressAr: feature.place_name_ar || feature.place_name,
    emirate,
    googleMapsUrl: generateGoogleMapsUrl(latitude, longitude),
  };
}

/**
 * Generate Google Maps URL from coordinates
 */
export function generateGoogleMapsUrl(latitude: number, longitude: number): string {
  return `https://maps.google.com/?q=${latitude},${longitude}`;
}

/**
 * Normalize Mapbox emirate text to our emirate ID format
 */
function normalizeEmirateFromMapbox(text: string): string {
  const normalized = text.toLowerCase().trim();

  const mappings: Record<string, string> = {
    'dubai': 'dubai',
    'abu dhabi': 'abu_dhabi',
    'sharjah': 'sharjah',
    'ajman': 'ajman',
    'ras al-khaimah': 'ras_al_khaimah',
    'ras al khaimah': 'ras_al_khaimah',
    'fujairah': 'fujairah',
    'umm al-quwain': 'umm_al_quwain',
    'umm al quwain': 'umm_al_quwain',
    // Arabic names
    'دبي': 'dubai',
    'أبوظبي': 'abu_dhabi',
    'الشارقة': 'sharjah',
    'عجمان': 'ajman',
    'رأس الخيمة': 'ras_al_khaimah',
    'الفجيرة': 'fujairah',
    'أم القيوين': 'umm_al_quwain',
  };

  return mappings[normalized] || '';
}

/**
 * Check if Mapbox is configured
 */
export function isMapboxConfigured(): boolean {
  return !!MAPBOX_ACCESS_TOKEN;
}
