import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface UseCurrentLocationResult {
  location: LocationCoords | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
  requestLocation: () => Promise<LocationCoords | null>;
}

export function useCurrentLocation(): UseCurrentLocationResult {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const requestLocation = useCallback(async (): Promise<LocationCoords | null> => {
    setLoading(true);
    setError(null);

    try {
      // Check/request permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setPermissionDenied(true);
        setError('Location permission denied');
        setLoading(false);
        return null;
      }

      setPermissionDenied(false);

      // Get current position
      const result = await Location.getCurrentPositionAsync({
        accuracy: Platform.OS === 'web'
          ? Location.Accuracy.Low  // Web doesn't support high accuracy well
          : Location.Accuracy.Balanced,
      });

      const coords: LocationCoords = {
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
      };

      setLocation(coords);
      setLoading(false);
      return coords;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get location';
      setError(message);
      setLoading(false);
      return null;
    }
  }, []);

  return {
    location,
    loading,
    error,
    permissionDenied,
    requestLocation,
  };
}
