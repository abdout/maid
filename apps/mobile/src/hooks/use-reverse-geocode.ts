import { useState, useCallback, useRef } from 'react';
import { reverseGeocode, type LocationData } from '@/lib/mapbox';

interface UseReverseGeocodeResult {
  locationData: LocationData | null;
  loading: boolean;
  error: string | null;
  geocode: (latitude: number, longitude: number) => Promise<LocationData | null>;
}

export function useReverseGeocode(): UseReverseGeocodeResult {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track latest request to prevent stale results
  const latestRequestRef = useRef<string>('');

  const geocode = useCallback(async (
    latitude: number,
    longitude: number
  ): Promise<LocationData | null> => {
    const requestKey = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
    latestRequestRef.current = requestKey;

    setLoading(true);
    setError(null);

    try {
      const data = await reverseGeocode(latitude, longitude);

      // Only update if this is still the latest request
      if (latestRequestRef.current === requestKey) {
        if (data) {
          setLocationData(data);
        } else {
          setError('Could not determine address');
        }
        setLoading(false);
        return data;
      }

      return null;
    } catch (err) {
      if (latestRequestRef.current === requestKey) {
        const message = err instanceof Error ? err.message : 'Geocoding failed';
        setError(message);
        setLoading(false);
      }
      return null;
    }
  }, []);

  return {
    locationData,
    loading,
    error,
    geocode,
  };
}
