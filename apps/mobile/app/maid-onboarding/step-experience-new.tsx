import { View, Text, TextInput, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMaidForm } from '@/store/maid-form';

const MAX_DETAILS_LENGTH = 70;

export default function StepExperienceNew() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { formData, updateFormData } = useMaidForm();

  return (
    <View>
      {/* Has Experience */}
      <View className="mb-5">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'لديها خبرة' : 'Has Experience'}
        </Text>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => updateFormData({ hasExperience: true })}
            className={`flex-1 px-4 py-3 rounded-xl border ${
              formData.hasExperience === true
                ? 'bg-primary-500 border-primary-500'
                : 'bg-background-0 border-background-200'
            }`}
          >
            <Text
              className={`text-center ${
                formData.hasExperience === true
                  ? 'text-white font-medium'
                  : 'text-typography-700'
              }`}
            >
              {t('common.yes')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => updateFormData({ hasExperience: false, experienceYears: 0 })}
            className={`flex-1 px-4 py-3 rounded-xl border ${
              formData.hasExperience === false
                ? 'bg-primary-500 border-primary-500'
                : 'bg-background-0 border-background-200'
            }`}
          >
            <Text
              className={`text-center ${
                formData.hasExperience === false
                  ? 'text-white font-medium'
                  : 'text-typography-700'
              }`}
            >
              {t('common.no')}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Experience Years - only show if hasExperience */}
      {formData.hasExperience && (
        <View className="mb-5">
          <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
            {t('filters.experience')} ({t('form.years')})
          </Text>
          <View className="flex-row items-center gap-4">
            <Pressable
              onPress={() =>
                updateFormData({
                  experienceYears: Math.max(0, formData.experienceYears - 1),
                })
              }
              className="w-12 h-12 bg-background-100 rounded-full items-center justify-center"
            >
              <Text className="text-2xl text-typography-700">-</Text>
            </Pressable>
            <View className="flex-1 bg-background-50 rounded-xl px-4 py-3.5 items-center">
              <Text className="text-typography-900 text-xl font-semibold">
                {formData.experienceYears}
              </Text>
            </View>
            <Pressable
              onPress={() =>
                updateFormData({
                  experienceYears: Math.min(30, formData.experienceYears + 1),
                })
              }
              className="w-12 h-12 bg-background-100 rounded-full items-center justify-center"
            >
              <Text className="text-2xl text-typography-700">+</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Experience Details - 70 chars */}
      <View>
        <View className={`flex-row justify-between items-center mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Text className="text-typography-700 font-medium">
            {isRTL ? 'تفاصيل الخبرة' : 'Experience Details'}
          </Text>
          <Text className="text-typography-400 text-xs">
            {formData.experienceDetails?.length || 0}/{MAX_DETAILS_LENGTH}
          </Text>
        </View>
        <TextInput
          value={formData.experienceDetails}
          onChangeText={(text) =>
            updateFormData({ experienceDetails: text.slice(0, MAX_DETAILS_LENGTH) })
          }
          placeholder={isRTL ? 'تفاصيل الخبرة السابقة...' : 'Details about previous experience...'}
          placeholderTextColor="#9CA3AF"
          maxLength={MAX_DETAILS_LENGTH}
          multiline
          numberOfLines={2}
          textAlign={isRTL ? 'right' : 'left'}
          className="bg-background-50 rounded-xl px-4 py-3.5 text-base text-typography-900"
        />
        <Text className={`text-typography-400 text-xs mt-1 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'يمكن الكتابة بالعربية أو الإنجليزية' : 'Can be written in Arabic or English'}
        </Text>
      </View>
    </View>
  );
}
