import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { SearchInput } from './search-input';
import { MapViewComponent } from './map-view';
import { type LocationData, type LocationPickerProps } from './types';
import { useCurrentLocation, useMapboxSearch, useReverseGeocode } from '@/hooks';
import { featureToLocationData, type MapboxFeature } from '@/lib/mapbox';
import { getEmirateName } from '@/constants/emirates';

export function LocationPicker({
  value,
  onChange,
  error,
  placeholder,
}: LocationPickerProps) {
  const { i18n, t } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [showResults, setShowResults] = useState(true);

  // Hooks
  const { requestLocation, loading: locationLoading } = useCurrentLocation();
  const { query, setQuery, results, loading: searchLoading, clearResults } = useMapboxSearch();
  const { geocode, loading: geocodeLoading } = useReverseGeocode();

  // Handle search result selection
  const handleSelectResult = useCallback((feature: MapboxFeature) => {
    const locationData = featureToLocationData(feature);
    onChange(locationData);
    clearResults();
    setShowResults(false);
  }, [onChange, clearResults]);

  // Handle map location change (tap or drag)
  const handleMapLocationChange = useCallback(async (latitude: number, longitude: number) => {
    // Reverse geocode to get address
    const locationData = await geocode(latitude, longitude);
    if (locationData) {
      onChange(locationData);
    }
  }, [geocode, onChange]);

  // Handle GPS button press
  const handleRequestCurrentLocation = useCallback(async () => {
    const coords = await requestLocation();
    if (coords) {
      handleMapLocationChange(coords.latitude, coords.longitude);
    }
  }, [requestLocation, handleMapLocationChange]);

  // Handle search input change
  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    setShowResults(true);
  }, [setQuery]);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    clearResults();
    setShowResults(false);
  }, [clearResults]);

  // Get displayed address
  const displayAddress = value
    ? (isRTL && value.addressAr ? value.addressAr : value.address)
    : null;

  // Get emirate display name
  const emirateDisplay = value?.emirate
    ? getEmirateName(value.emirate, isRTL)
    : null;

  return (
    <View className="gap-4">
      {/* Search Input */}
      <SearchInput
        query={query}
        onQueryChange={handleQueryChange}
        results={showResults ? results : []}
        loading={searchLoading}
        onSelectResult={handleSelectResult}
        onClear={handleClearSearch}
        placeholder={placeholder}
      />

      {/* Map View - taller height per user request */}
      <MapViewComponent
        latitude={value?.latitude}
        longitude={value?.longitude}
        onLocationChange={handleMapLocationChange}
        onRequestCurrentLocation={handleRequestCurrentLocation}
        loadingLocation={locationLoading}
        height={320}
      />

      {/* Address Preview */}
      {(displayAddress || geocodeLoading) && (
        <View className={`flex-row items-start gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Ionicons
            name="location"
            size={18}
            color="#2563EB"
            style={{ marginTop: 2 }}
          />
          <View className="flex-1">
            {geocodeLoading ? (
              <Text className={`text-sm text-typography-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('locationPicker.detectingAddress')}
              </Text>
            ) : (
              <>
                <Text
                  className={`text-sm text-typography-700 ${isRTL ? 'text-right' : 'text-left'}`}
                  numberOfLines={2}
                >
                  {displayAddress}
                </Text>
                {emirateDisplay && (
                  <Text className={`text-xs text-primary-600 mt-0.5 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {emirateDisplay}
                  </Text>
                )}
              </>
            )}
          </View>
        </View>
      )}

      {/* Error Message */}
      {error && (
        <Text className={`text-xs text-error-500 ${isRTL ? 'text-right' : 'text-left'}`}>
          {error}
        </Text>
      )}
    </View>
  );
}
