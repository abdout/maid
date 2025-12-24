import { useState } from 'react';
import { View, Text, Pressable, Platform, Modal } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { CalendarIcon } from '@/components/icons';

interface DateOfBirthPickerProps {
  value: string;
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
  return date.toISOString().split('T')[0];
}

function parseDate(dateString: string): Date {
  if (!dateString) {
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 25);
    return defaultDate;
  }
  return new Date(dateString + 'T00:00:00');
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
  const [tempDate, setTempDate] = useState<Date>(parseDate(value));

  const today = new Date();
  const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
  const minDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());

  const currentDate = value ? parseDate(value) : null;
  const age = currentDate ? calculateAge(currentDate) : null;

  const isAgeValid = age !== null && age >= minAge && age <= maxAge;

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'set' && selectedDate) {
        onChange(formatDate(selectedDate));
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleConfirm = () => {
    onChange(formatDate(tempDate));
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempDate(currentDate || parseDate(''));
    setShowPicker(false);
  };

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
        {t('form.dateOfBirth')} *
      </Text>

      <Pressable
        onPress={() => {
          setTempDate(currentDate || parseDate(''));
          setShowPicker(true);
        }}
        className={`bg-background-50 rounded-xl px-4 py-3.5 flex-row items-center justify-between ${
          error ? 'border border-error-500' : ''
        } ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <View className={`flex-row items-center flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <CalendarIcon size={20} color={value ? '#222222' : '#9CA3AF'} />
          <Text className={`text-typography-${value ? '900' : '400'} flex-1 ${isRTL ? 'text-right mr-3' : 'ml-3'}`}>
            {displayDate || (isRTL ? 'اختر تاريخ الميلاد' : 'Select date of birth')}
          </Text>
        </View>

        {age !== null && (
          <View className={`px-3 py-1 rounded-full ${isAgeValid ? 'bg-primary-100' : 'bg-error-100'}`}>
            <Text className={`font-semibold text-sm ${isAgeValid ? 'text-primary-700' : 'text-error-700'}`}>
              {age} {t('common.years')}
            </Text>
          </View>
        )}
      </Pressable>

      {error && (
        <Text className="text-error-500 text-sm mt-1">{error}</Text>
      )}

      {age !== null && !isAgeValid && (
        <Text className="text-error-500 text-sm mt-1">
          {isRTL
            ? `العمر يجب أن يكون بين ${minAge} و ${maxAge} سنة`
            : `Age must be between ${minAge} and ${maxAge} years`
          }
        </Text>
      )}

      {Platform.OS === 'ios' && (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
        >
          <View className="flex-1 justify-end">
            <Pressable
              className="flex-1 bg-black/50"
              onPress={handleCancel}
            />
            <View className="bg-background-0 rounded-t-3xl">
              <View className={`flex-row items-center justify-between px-6 py-4 border-b border-background-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Pressable onPress={handleCancel}>
                  <Text className="text-typography-500 text-base">
                    {t('common.cancel')}
                  </Text>
                </Pressable>
                <Text className="text-typography-900 font-semibold text-lg">
                  {t('form.dateOfBirth')}
                </Text>
                <Pressable onPress={handleConfirm}>
                  <Text className="text-primary-500 font-semibold text-base">
                    {t('common.done')}
                  </Text>
                </Pressable>
              </View>

              <View className="items-center py-4">
                <View className="bg-primary-100 px-6 py-2 rounded-full">
                  <Text className="text-primary-700 font-bold text-xl">
                    {calculateAge(tempDate)} {t('common.years')}
                  </Text>
                </View>
              </View>

              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={maxDate}
                minimumDate={minDate}
                locale={isRTL ? 'ar' : 'en'}
              />

              <View className="h-8" />
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={maxDate}
          minimumDate={minDate}
        />
      )}
    </View>
  );
}
