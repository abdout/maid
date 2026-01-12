import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  useMaidForm,
  type MaritalStatus,
  type Religion,
  type Sex,
  type Education,
  SEX_OPTIONS,
  EDUCATION_OPTIONS,
  RELIGION_OPTIONS,
} from '@/store/maid-form';
import { NATIONALITIES } from '@/constants';
import { DateOfBirthPicker } from '@/components/date-of-birth-picker';

export default function StepBasic() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { formData, updateFormData, errors } = useMaidForm();

  const maritalStatusOptions: MaritalStatus[] = ['single', 'married', 'divorced', 'widowed'];

  return (
    <View>
      {/* Name (English) */}
      <View className="mb-5">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {t('form.nameEn')} *
        </Text>
        <TextInput
          value={formData.name}
          onChangeText={(v) => updateFormData({ name: v })}
          placeholder={t('form.namePlaceholder')}
          className={`bg-background-50 rounded-xl px-4 py-3.5 text-typography-900 ${
            errors.name ? 'border border-error-500' : ''
          }`}
        />
        {errors.name && (
          <Text className="text-error-500 text-sm mt-1">{errors.name}</Text>
        )}
      </View>

      {/* Name (Arabic) */}
      <View className="mb-5">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {t('form.nameAr')}
        </Text>
        <TextInput
          value={formData.nameAr}
          onChangeText={(v) => updateFormData({ nameAr: v })}
          placeholder="الاسم الكامل"
          className="bg-background-50 rounded-xl px-4 py-3.5 text-typography-900 text-right"
        />
      </View>

      {/* Sex */}
      <View className="mb-5">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'الجنس' : 'Sex'} *
        </Text>
        <View className="flex-row gap-2">
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

      {/* Nationality */}
      <View className="mb-5">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {t('filters.nationality')} *
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 pb-1">
            {NATIONALITIES.map((nat) => (
              <Pressable
                key={nat.id}
                onPress={() => updateFormData({ nationalityId: nat.id })}
                className={`px-4 py-2.5 rounded-full border ${
                  formData.nationalityId === nat.id
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-background-0 border-background-200'
                }`}
              >
                <Text
                  className={
                    formData.nationalityId === nat.id
                      ? 'text-white font-medium'
                      : 'text-typography-700'
                  }
                >
                  {nat.flag} {isRTL ? nat.nameAr : nat.nameEn}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
        {errors.nationalityId && (
          <Text className="text-error-500 text-sm mt-1">{errors.nationalityId}</Text>
        )}
      </View>

      {/* Date of Birth */}
      <DateOfBirthPicker
        value={formData.dateOfBirth}
        onChange={(date) => updateFormData({ dateOfBirth: date })}
        error={errors.dateOfBirth}
        minAge={21}
        maxAge={50}
      />

      {/* Education */}
      <View className="mb-5">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'التعليم' : 'Education'}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {EDUCATION_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => updateFormData({ education: option.id as Education })}
              className={`px-4 py-2.5 rounded-full border ${
                formData.education === option.id
                  ? 'bg-primary-500 border-primary-500'
                  : 'bg-background-0 border-background-200'
              }`}
            >
              <Text
                className={
                  formData.education === option.id
                    ? 'text-white font-medium'
                    : 'text-typography-700'
                }
              >
                {isRTL ? option.labelAr : option.labelEn}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Marital Status */}
      <View className="mb-5">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {t('filters.maritalStatus')} *
        </Text>
        <View className="flex-row flex-wrap gap-2">
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
        {errors.maritalStatus && (
          <Text className="text-error-500 text-sm mt-1">{errors.maritalStatus}</Text>
        )}
      </View>

      {/* Has Children */}
      <View className="mb-5">
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

      {/* Religion */}
      <View className="mb-6">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {t('filters.religion')}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {RELIGION_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => updateFormData({ religion: option.id as Religion })}
              className={`px-4 py-2.5 rounded-full border ${
                formData.religion === option.id
                  ? 'bg-primary-500 border-primary-500'
                  : 'bg-background-0 border-background-200'
              }`}
            >
              <Text
                className={
                  formData.religion === option.id
                    ? 'text-white font-medium'
                    : 'text-typography-700'
                }
              >
                {isRTL ? option.labelAr : option.labelEn}
              </Text>
            </Pressable>
          ))}
        </View>
        {errors.religion && (
          <Text className="text-error-500 text-sm mt-1">{errors.religion}</Text>
        )}
      </View>
    </View>
  );
}
