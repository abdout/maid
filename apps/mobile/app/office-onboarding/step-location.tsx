import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { useOfficeForm } from '@/store/office-form';
import { LocationPicker, type LocationData } from '@/components';

export default function StepLocation() {
  const { t } = useTranslation();
  const { formData, updateFormData, errors } = useOfficeForm();

  // Build location value from form data
  const locationValue: LocationData | null = formData.latitude && formData.longitude
    ? {
        latitude: formData.latitude,
        longitude: formData.longitude,
        address: formData.address,
        addressAr: formData.addressAr,
        emirate: formData.emirate,
        googleMapsUrl: formData.googleMapsUrl,
      }
    : null;

  // Handle location change from picker
  const handleLocationChange = useCallback((location: LocationData) => {
    updateFormData({
      address: location.address,
      addressAr: location.addressAr,
      emirate: location.emirate,
      googleMapsUrl: location.googleMapsUrl,
      latitude: location.latitude,
      longitude: location.longitude,
    });
  }, [updateFormData]);

  return (
    <View className="gap-5 pt-8">
      {/* Location Picker */}
      <LocationPicker
        value={locationValue}
        onChange={handleLocationChange}
        error={errors.location}
        placeholder={t('locationPicker.searchPlaceholder')}
      />
    </View>
  );
}
