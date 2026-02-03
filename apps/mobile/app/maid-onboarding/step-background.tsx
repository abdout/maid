import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  useMaidForm,
  type Education,
  type Religion,
  EDUCATION_OPTIONS,
  RELIGION_OPTIONS,
} from '@/store/maid-form';

export default function StepBackground() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { formData, updateFormData, errors } = useMaidForm();

  return (
    <View>
      {/* Education */}
      <View className="mb-6">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'التعليم' : 'Education'}
        </Text>
        <View className={`flex-row flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
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

      {/* Religion */}
      <View>
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

      {/* Info Note */}
      <View className="bg-background-50 rounded-xl p-4 mt-6">
        <Text className={`text-typography-500 text-sm ${isRTL ? 'text-right' : ''}`}>
          {isRTL
            ? 'هذه المعلومات تساعد العملاء في البحث عن العاملة المناسبة'
            : 'This information helps customers find the right worker'}
        </Text>
      </View>
    </View>
  );
}
