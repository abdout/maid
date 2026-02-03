/**
 * DateOfBirthPicker - Apple-style wheel date picker
 *
 * Features:
 * - Unified UX across iOS, Android, and Web
 * - Three-column wheel picker (Day, Month, Year)
 * - RTL support for Arabic
 * - Age display with validation
 * - Min/max age constraints
 */

import { useState, useCallback } from 'react';
import { View, Text, Pressable, Modal, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CalendarIcon } from '@/components/icons';
import { WheelDatePicker } from './wheel-picker';

interface DateOfBirthPickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  error?: string;
  minAge?: number;
  maxAge?: number;
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDefaultDate(minAge: number): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - minAge - 5);
  return date;
}

function parseDate(dateString: string, minAge: number): Date {
  if (!dateString) {
    return getDefaultDate(minAge);
  }
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function DateOfBirthPicker({
  value,
  onChange,
  error,
  minAge = 21,
  maxAge = 50,
}: DateOfBirthPickerProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(() => parseDate(value, minAge));

  // Calculate date constraints from age limits
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
  const minDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());

  // Current selected date and age
  const currentDate = value ? parseDate(value, minAge) : null;
  const age = currentDate ? calculateAge(currentDate) : null;
  const isAgeValid = age !== null && age >= minAge && age <= maxAge;

  // Temp date age for picker display
  const tempAge = calculateAge(tempDate);
  const isTempAgeValid = tempAge >= minAge && tempAge <= maxAge;

  const openPicker = useCallback(() => {
    setTempDate(currentDate || getDefaultDate(minAge));
    setShowPicker(true);
  }, [currentDate, minAge]);

  const handleDateChange = useCallback((date: Date) => {
    setTempDate(date);
  }, []);

  const handleConfirm = useCallback(() => {
    onChange(formatDate(tempDate));
    setShowPicker(false);
  }, [onChange, tempDate]);

  const handleCancel = useCallback(() => {
    setShowPicker(false);
  }, []);

  // Format display date based on locale
  const displayDate = currentDate
    ? currentDate.toLocaleDateString(isRTL ? 'ar-AE' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <View className="mb-5">
      <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
        {t('form.dateOfBirth')}
      </Text>

      {/* Trigger Button */}
      <Pressable
        onPress={openPicker}
        className={`bg-background-50 rounded-xl px-4 py-3.5 flex-row items-center justify-between ${
          error ? 'border border-error-500' : ''
        } ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <View className={`flex-row items-center flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <CalendarIcon size={20} color={value ? '#222222' : '#9CA3AF'} />
          <Text
            className={`text-typography-${value ? '900' : '400'} flex-1 ${
              isRTL ? 'text-right mr-3' : 'ml-3'
            }`}
          >
            {displayDate || (isRTL ? 'اختر تاريخ الميلاد' : 'Select date of birth')}
          </Text>
        </View>

        {age !== null && (
          <View
            className={`px-3 py-1 rounded-full ${isAgeValid ? 'bg-primary-100' : 'bg-error-100'}`}
          >
            <Text
              className={`font-semibold text-sm ${
                isAgeValid ? 'text-primary-700' : 'text-error-700'
              }`}
            >
              {age} {t('common.years')}
            </Text>
          </View>
        )}
      </Pressable>

      {/* Error Message */}
      {error && <Text className="text-error-500 text-sm mt-1">{error}</Text>}

      {/* Age Validation Warning */}
      {age !== null && !isAgeValid && (
        <Text className="text-error-500 text-sm mt-1">
          {isRTL
            ? `العمر يجب أن يكون بين ${minAge} و ${maxAge} سنة`
            : `Age must be between ${minAge} and ${maxAge} years`}
        </Text>
      )}

      {/* Picker Modal */}
      <Modal visible={showPicker} transparent animationType="slide" onRequestClose={handleCancel}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          {/* Backdrop */}
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
            onPress={handleCancel}
          />

          {/* Picker Container */}
          <View
            style={{
              backgroundColor: 'white',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: Platform.OS === 'ios' ? 34 : 24,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 24,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#F3F4F6',
              }}
            >
              <Pressable onPress={handleCancel} hitSlop={10}>
                <Text style={{ color: '#6B7280', fontSize: 16 }}>{t('common.cancel')}</Text>
              </Pressable>
              <Text style={{ color: '#111827', fontWeight: '600', fontSize: 18 }}>
                {t('form.dateOfBirth')}
              </Text>
              <Pressable onPress={handleConfirm} hitSlop={10}>
                <Text style={{ color: '#FF385C', fontWeight: '600', fontSize: 16 }}>
                  {t('common.done')}
                </Text>
              </Pressable>
            </View>

            {/* Age Display */}
            <View style={{ alignItems: 'center', paddingVertical: 16 }}>
              <View
                style={{
                  backgroundColor: isTempAgeValid ? '#FFE4E6' : '#FEE2E2',
                  paddingHorizontal: 24,
                  paddingVertical: 8,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    color: isTempAgeValid ? '#BE123C' : '#DC2626',
                    fontWeight: '700',
                    fontSize: 20,
                  }}
                >
                  {tempAge} {t('common.years')}
                </Text>
              </View>
            </View>

            {/* Wheel Date Picker */}
            <View style={{ paddingHorizontal: 16 }}>
              <WheelDatePicker
                value={tempDate}
                onChange={handleDateChange}
                minimumDate={minDate}
                maximumDate={maxDate}
                locale={i18n.language}
              />
            </View>

            {/* Bottom spacing */}
            <View style={{ height: 16 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
