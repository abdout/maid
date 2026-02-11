import { View, Platform, Text } from 'react-native';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { UAE_CENTER } from '@/constants/emirates';

interface MapViewProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (latitude: number, longitude: number) => void;
  onRequestCurrentLocation: () => void;
  loadingLocation: boolean;
  height?: number;
}

// Dynamically import Mapbox only for native platforms
let MapboxGL: typeof import('@rnmapbox/maps').default | null = null;
if (Platform.OS !== 'web') {
  try {
    MapboxGL = require('@rnmapbox/maps').default;
  } catch {
    // Mapbox not available
  }
}

// Import web map component for web platform
const MapViewWeb = Platform.OS === 'web'
  ? require('./map-view-web').MapViewWeb
  : null;

export function MapViewComponent({
  latitude,
  longitude,
  onLocationChange,
  onRequestCurrentLocation,
  loadingLocation,
  height = 280,
}: MapViewProps) {
  const mapRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  // Default to UAE center if no coordinates provided
  const currentLat = latitude || UAE_CENTER[1];
  const currentLng = longitude || UAE_CENTER[0];

  // Handle map press to place/move pin
  const handleMapPress = useCallback((event: any) => {
    if (Platform.OS === 'web') {
      // Web doesn't have the same event structure
      return;
    }

    const { geometry } = event;
    if (geometry?.coordinates) {
      const [lng, lat] = geometry.coordinates;
      onLocationChange(lat, lng);
    }
  }, [onLocationChange]);

  // Center map on coordinates when they change
  useEffect(() => {
    if (mapRef.current && mapReady && latitude && longitude) {
      mapRef.current.setCamera({
        centerCoordinate: [longitude, latitude],
        zoomLevel: 15,
        animationDuration: 500,
      });
    }
  }, [latitude, longitude, mapReady]);

  // Web - use Mapbox GL JS
  if (Platform.OS === 'web' && MapViewWeb) {
    return (
      <MapViewWeb
        latitude={latitude}
        longitude={longitude}
        onLocationChange={onLocationChange}
        onRequestCurrentLocation={onRequestCurrentLocation}
        loadingLocation={loadingLocation}
        height={height}
      />
    );
  }

  // Native without Mapbox - show fallback
  if (!MapboxGL) {
    return (
      <View
        style={{ height }}
        className="bg-background-100 rounded-xl overflow-hidden relative"
      >
        <View className="flex-1 items-center justify-center p-4">
          <Ionicons name="map-outline" size={48} color="#9CA3AF" />
          <Text className="text-typography-500 text-center mt-3 text-sm">
            Map not available
          </Text>
          {latitude && longitude && (
            <Text className="text-typography-400 text-center mt-2 text-xs">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </Text>
          )}
        </View>
      </View>
    );
  }

  // Native Mapbox implementation
  return (
    <View
      style={{ height }}
      className="rounded-xl overflow-hidden relative"
    >
      <MapboxGL.MapView
        ref={mapRef}
        style={{ flex: 1 }}
        styleURL={MapboxGL.StyleURL.Street}
        onDidFinishLoadingMap={() => setMapReady(true)}
        onPress={handleMapPress}
        attributionEnabled={false}
        logoEnabled={false}
      >
        <MapboxGL.Camera
          defaultSettings={{
            centerCoordinate: [currentLng, currentLat],
            zoomLevel: latitude ? 15 : 8,
          }}
        />

        {/* Pin Marker */}
        {latitude && longitude && (
          <MapboxGL.PointAnnotation
            id="selected-location"
            coordinate={[longitude, latitude]}
            draggable
            onDragEnd={(event: any) => {
              const { geometry } = event;
              if (geometry?.coordinates) {
                const [lng, lat] = geometry.coordinates;
                onLocationChange(lat, lng);
              }
            }}
          >
            <View className="items-center">
              <View className="w-8 h-8 rounded-full bg-primary-600 items-center justify-center shadow-lg">
                <Ionicons name="location" size={20} color="white" />
              </View>
              <View className="w-2 h-2 bg-primary-600 -mt-1 rotate-45" />
            </View>
          </MapboxGL.PointAnnotation>
        )}
      </MapboxGL.MapView>

      {/* Tap hint overlay when no pin */}
      {!latitude && !longitude && mapReady && (
        <View className="absolute top-3 left-3 right-3 bg-background-0/90 rounded-lg px-3 py-2">
          <Text className="text-typography-600 text-xs text-center">
            Tap on the map to place a pin
          </Text>
        </View>
      )}
    </View>
  );
}
