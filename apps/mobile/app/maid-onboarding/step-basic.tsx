import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMaidForm, type MaritalStatus, type Religion } from '@/store/maid-form';
import { useNationalities } from '@/hooks';
import { DateOfBirthPicker } from '@/components/date-of-birth-picker';

export default function StepBasic() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { formData, updateFormData, errors } = useMaidForm();
  const { data: nationalitiesData } = useNationalities();
  const nationalities = nationalitiesData?.data || [];

  const maritalStatusOptions: MaritalStatus[] = ['single', 'married', 'divorced', 'widowed'];
  const religionOptions: Religion[] = ['muslim', 'non_muslim'];

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

        {/* Nationality */}
        <View className="mb-5">
          <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
            {t('filters.nationality')} *
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2 pb-1">
              {nationalities.map((nat) => (
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
                    {isRTL ? nat.nameAr : nat.nameEn}
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

        {/* Religion */}
        <View className="mb-6">
          <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
            {t('filters.religion')} *
          </Text>
          <View className="flex-row gap-2">
            {religionOptions.map((rel) => (
              <Pressable
                key={rel}
                onPress={() => updateFormData({ religion: rel })}
                className={`px-4 py-2.5 rounded-full border ${
                  formData.religion === rel
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-background-0 border-background-200'
                }`}
              >
                <Text
                  className={
                    formData.religion === rel
                      ? 'text-white font-medium'
                      : 'text-typography-700'
                  }
                >
                  {t(`religion.${rel}`)}
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
