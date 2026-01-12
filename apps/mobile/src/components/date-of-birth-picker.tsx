import { useState, useCallback, useRef } from 'react';
import { View, Text, Pressable, Platform, Modal, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { CalendarIcon } from '@/components/icons';

const isWeb = Platform.OS === 'web';

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

  const today = new Date();
  const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
  const minDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());

  const currentDate = value ? parseDate(value, minAge) : null;
  const age = currentDate ? calculateAge(currentDate) : null;
  const isAgeValid = age !== null && age >= minAge && age <= maxAge;

  const webInputRef = useRef<TextInput>(null);

  const openPicker = useCallback(() => {
    if (isWeb) {
      // On web, trigger the hidden date input
      (webInputRef.current as unknown as HTMLInputElement)?.showPicker?.();
      (webInputRef.current as unknown as HTMLInputElement)?.click?.();
    } else {
      setTempDate(currentDate || getDefaultDate(minAge));
      setShowPicker(true);
    }
  }, [currentDate, minAge]);

  const handleWebDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      onChange(dateValue);
    }
  }, [onChange]);

  const handleDateChange = useCallback((_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (selectedDate) {
        onChange(formatDate(selectedDate));
      }
    } else if (selectedDate) {
      setTempDate(selectedDate);
    }
  }, [onChange]);

  const handleConfirm = useCallback(() => {
    onChange(formatDate(tempDate));
    setShowPicker(false);
  }, [onChange, tempDate]);

  const handleCancel = useCallback(() => {
    setShowPicker(false);
  }, []);

  const displayDate = currentDate
    ? currentDate.toLocaleDateString(isRTL ? 'ar-AE' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <View className="mb-5" style={isWeb ? { position: 'relative' } : undefined}>
      <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
        {t('form.dateOfBirth')} *
      </Text>

      <Pressable
        onPress={openPicker}
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

      {/* Web date input - styled to overlay the Pressable */}
      {isWeb && (
        <input
          ref={webInputRef as unknown as React.RefObject<HTMLInputElement>}
          type="date"
          value={value || ''}
          onChange={handleWebDateChange as unknown as React.ChangeEventHandler<HTMLInputElement>}
          min={formatDate(minDate)}
          max={formatDate(maxDate)}
          style={{
            position: 'absolute',
            top: 28,
            left: 0,
            right: 0,
            height: 52,
            opacity: 0,
            cursor: 'pointer',
            zIndex: 10,
          }}
        />
      )}

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

      {Platform.OS === 'ios' && showPicker && (
        <Modal
          visible={true}
          transparent
          animationType="slide"
          onRequestClose={handleCancel}
        >
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <Pressable
              style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
              onPress={handleCancel}
            />
            <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
              <View style={{
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 24,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#F3F4F6'
              }}>
                <Pressable onPress={handleCancel} hitSlop={10}>
                  <Text style={{ color: '#6B7280', fontSize: 16 }}>
                    {t('common.cancel')}
                  </Text>
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

              <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                <View style={{ backgroundColor: '#FFE4E6', paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20 }}>
                  <Text style={{ color: '#BE123C', fontWeight: '700', fontSize: 20 }}>
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
              />

              <View style={{ height: 32 }} />
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
