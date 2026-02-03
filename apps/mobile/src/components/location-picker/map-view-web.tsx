'use client';

import { useRef, useEffect, useCallback } from 'react';
import { View, Pressable, ActivityIndicator, Text } from 'react-native';
import mapboxgl from 'mapbox-gl';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { UAE_CENTER } from '@/constants/emirates';

// Set access token
mapboxgl.accessToken = Constants.expoConfig?.extra?.mapboxAccessToken || '';

interface MapViewWebProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (latitude: number, longitude: number) => void;
  onRequestCurrentLocation: () => void;
  loadingLocation: boolean;
  height?: number;
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
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [currentLng, currentLat],
      zoom: latitude ? 15 : 8,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Handle map click to place pin
    map.current.on('click', (e) => {
      handleLocationChange(e.lngLat.lat, e.lngLat.lng);
    });

    return () => {
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update marker when coordinates change
  useEffect(() => {
    if (!map.current) return;

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
  }, [latitude, longitude, handleLocationChange]);

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
