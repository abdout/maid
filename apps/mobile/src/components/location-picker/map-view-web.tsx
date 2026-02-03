'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { View, Pressable, ActivityIndicator, Text } from 'react-native';
import mapboxgl from 'mapbox-gl';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { UAE_CENTER } from '@/constants/emirates';

// Get access token from config
const MAPBOX_TOKEN = Constants.expoConfig?.extra?.mapboxAccessToken || '';

// Set access token (will be empty string if not configured)
mapboxgl.accessToken = MAPBOX_TOKEN;

interface MapViewWebProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (latitude: number, longitude: number) => void;
  onRequestCurrentLocation: () => void;
  loadingLocation: boolean;
  height?: number;
}

// Fallback component when Mapbox token is not available
function MapFallback({
  latitude,
  longitude,
  onRequestCurrentLocation,
  loadingLocation,
  height,
}: Omit<MapViewWebProps, 'onLocationChange'>) {
  return (
    <View
      style={{ height }}
      className="bg-background-100 rounded-xl overflow-hidden relative"
    >
      <View className="flex-1 items-center justify-center p-4">
        <Ionicons name="map-outline" size={48} color="#9CA3AF" />
        <Text className="text-typography-600 text-center mt-3 text-sm font-medium">
          Use GPS to set your location
        </Text>
        <Text className="text-typography-400 text-center mt-1 text-xs">
          Tap the button below to auto-detect
        </Text>
        {latitude && longitude && (
          <View className="mt-4 bg-background-0 rounded-lg px-4 py-2">
            <Text className="text-typography-500 text-center text-xs">
              📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </Text>
          </View>
        )}
      </View>

      {/* GPS Button - centered and prominent */}
      <View className="absolute bottom-4 left-0 right-0 items-center">
        <Pressable
          onPress={onRequestCurrentLocation}
          disabled={loadingLocation}
          className="flex-row items-center gap-2 bg-primary-600 rounded-full px-6 py-3 shadow-lg"
        >
          {loadingLocation ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons name="locate" size={20} color="white" />
          )}
          <Text className="text-white font-semibold">
            {loadingLocation ? 'Detecting...' : 'Use My Location'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export function MapViewWeb({
  latitude,
  longitude,
  onLocationChange,
  onRequestCurrentLocation,
  loadingLocation,
  height = 280,
}: MapViewWebProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  const currentLat = latitude || UAE_CENTER[1];
  const currentLng = longitude || UAE_CENTER[0];

  // Memoize the location change handler
  const handleLocationChange = useCallback(
    (lat: number, lng: number) => {
      onLocationChange(lat, lng);
    },
    [onLocationChange]
  );

  // Initialize map
  useEffect(() => {
    // Check for token before attempting to create map
    if (!MAPBOX_TOKEN) {
      setMapError(true);
      return;
    }

    if (!mapContainer.current || map.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [currentLng, currentLat],
        zoom: latitude ? 15 : 8,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Handle map load
      map.current.on('load', () => {
        setMapReady(true);
      });

      // Handle map click to place pin
      map.current.on('click', (e) => {
        handleLocationChange(e.lngLat.lat, e.lngLat.lng);
      });

      // Handle map errors
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError(true);
      });
    } catch (err) {
      console.error('Failed to initialize map:', err);
      setMapError(true);
    }

    return () => {
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      map.current?.remove();
      map.current = null;
    };
  }, [currentLat, currentLng, latitude, handleLocationChange]);

  // Update marker when coordinates change
  useEffect(() => {
    if (!map.current || !mapReady) return;

    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
      marker.current = null;
    }

    // Only add marker if we have coordinates
    if (latitude && longitude) {
      // Add new draggable marker
      marker.current = new mapboxgl.Marker({ draggable: true, color: '#FF385C' })
        .setLngLat([longitude, latitude])
        .addTo(map.current);

      // Handle marker drag end
      marker.current.on('dragend', () => {
        const lngLat = marker.current?.getLngLat();
        if (lngLat) {
          handleLocationChange(lngLat.lat, lngLat.lng);
        }
      });

      // Center map on new location
      map.current.flyTo({ center: [longitude, latitude], zoom: 15 });
    }
  }, [latitude, longitude, handleLocationChange, mapReady]);

  // Show fallback if no token or map error
  if (!MAPBOX_TOKEN || mapError) {
    return (
      <MapFallback
        latitude={latitude}
        longitude={longitude}
        onRequestCurrentLocation={onRequestCurrentLocation}
        loadingLocation={loadingLocation}
        height={height}
      />
    );
  }

  return (
    <View style={{ height }} className="rounded-xl overflow-hidden relative">
      {/* Map container */}
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 12,
        }}
      />

      {/* GPS Button */}
      <Pressable
        onPress={onRequestCurrentLocation}
        disabled={loadingLocation}
        className="absolute bottom-3 right-3 w-11 h-11 bg-background-0 rounded-full items-center justify-center shadow-md border border-background-200"
        style={{
          zIndex: 10,
        }}
      >
        {loadingLocation ? (
          <ActivityIndicator size="small" color="#2563EB" />
        ) : (
          <Ionicons name="locate" size={22} color="#2563EB" />
        )}
      </Pressable>

      {/* Tap hint when no pin */}
      {!latitude && !longitude && (
        <View
          className="absolute top-3 left-3 right-3 bg-background-0/90 rounded-lg px-3 py-2"
          style={{ zIndex: 10 }}
        >
          <Text className="text-typography-600 text-xs text-center">
            Tap on the map to place a pin
          </Text>
        </View>
      )}
    </View>
  );
}
