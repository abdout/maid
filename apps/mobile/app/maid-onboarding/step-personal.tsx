import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  useMaidForm,
  type MaritalStatus,
  type Sex,
  SEX_OPTIONS,
} from '@/store/maid-form';
import { DateOfBirthPicker } from '@/components/date-of-birth-picker';

export default function StepPersonal() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { formData, updateFormData, errors } = useMaidForm();

  const maritalStatusOptions: MaritalStatus[] = ['single', 'married', 'divorced', 'widowed'];

  return (
    <View className="pt-8">
      {/* Sex */}
      <View className="mb-5">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'الجنس' : 'Sex'}
        </Text>
        <View className={`flex-row gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {SEX_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => updateFormData({ sex: option.id as Sex })}
              className={`flex-1 px-4 py-3 rounded-xl border ${
                formData.sex === option.id
                  ? 'bg-primary-500 border-primary-500'
                  : 'bg-background-0 border-background-200'
              }`}
            >
              <Text
                className={`text-center ${
                  formData.sex === option.id
                    ? 'text-white font-medium'
                    : 'text-typography-700'
                }`}
              >
                {isRTL ? option.labelAr : option.labelEn}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Date of Birth */}
      <DateOfBirthPicker
        value={formData.dateOfBirth}
        onChange={(date) => updateFormData({ dateOfBirth: date })}
        error={errors.dateOfBirth}
        minAge={21}
        maxAge={50}
      />

      {/* Marital Status */}
      <View className="mb-5">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {t('filters.maritalStatus')}
        </Text>
        <View className={`flex-row flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {maritalStatusOptions.map((status) => (
            <Pressable
              key={status}
              onPress={() => updateFormData({ maritalStatus: status })}
              className={`px-4 py-2.5 rounded-full border ${
                formData.maritalStatus === status
                  ? 'bg-primary-500 border-primary-500'
                  : 'bg-background-0 border-background-200'
              }`}
            >
              <Text
                className={
                  formData.maritalStatus === status
                    ? 'text-white font-medium'
                    : 'text-typography-700'
                }
              >
                {t(`maritalStatus.${status}`)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Has Children */}
      <View>
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'لديها أطفال' : 'Has Children'}
        </Text>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => updateFormData({ hasChildren: true })}
            className={`flex-1 px-4 py-3 rounded-xl border ${
              formData.hasChildren === true
                ? 'bg-primary-500 border-primary-500'
                : 'bg-background-0 border-background-200'
            }`}
          >
            <Text
              className={`text-center ${
                formData.hasChildren === true
                  ? 'text-white font-medium'
                  : 'text-typography-700'
              }`}
            >
              {t('common.yes')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => updateFormData({ hasChildren: false })}
            className={`flex-1 px-4 py-3 rounded-xl border ${
              formData.hasChildren === false
                ? 'bg-primary-500 border-primary-500'
                : 'bg-background-0 border-background-200'
            }`}
          >
            <Text
              className={`text-center ${
                formData.hasChildren === false
                  ? 'text-white font-medium'
                  : 'text-typography-700'
              }`}
            >
              {t('common.no')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
