import { View, Text, TextInput, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMaidForm } from '@/store/maid-form';
import { DirhamIcon } from '@/components/icons';

const MAX_DETAILS_LENGTH = 70;

// Experience year options matching filter modal
const EXPERIENCE_OPTIONS = [0, 1, 2, 3, 5];

export default function StepExperienceNew() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { formData, updateFormData, errors } = useMaidForm();

  const handleExperienceSelect = (years: number) => {
    updateFormData({
      experienceYears: years,
      hasExperience: years > 0,
    });
  };

  return (
    <View>
      {/* Experience Years - Range pills matching filter */}
      <View className="mb-5">
        <Text className={`text-typography-700 mb-3 font-medium ${isRTL ? 'text-right' : ''}`}>
          {t('filters.experience')} ({t('filters.minYearsLabel', 'min years')})
        </Text>
        <View className={`flex-row gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {EXPERIENCE_OPTIONS.map((years) => (
            <Pressable
              key={years}
              onPress={() => handleExperienceSelect(years)}
              className={`px-4 py-2.5 rounded-full border ${
                formData.experienceYears === years
                  ? 'bg-primary-500 border-primary-500'
                  : 'bg-background-0 border-background-200'
              }`}
            >
              <Text
                className={
                  formData.experienceYears === years
                    ? 'text-white font-medium'
                    : 'text-typography-700'
                }
              >
                {years}+
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Experience Details - Taller textarea */}
      <View className="mb-5">
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
          numberOfLines={4}
          textAlignVertical="top"
          textAlign={isRTL ? 'right' : 'left'}
          className="bg-background-50 rounded-xl px-4 py-3.5 text-base text-typography-900 min-h-[100px]"
        />
      </View>

      {/* Salary */}
      <View className="mb-5">
        <View className={`flex-row items-center mb-2 gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Text className="text-typography-700 font-medium">
            {t('filters.salary')}
          </Text>
          <Text className="text-typography-700">(</Text>
          <DirhamIcon size={14} color="#374151" />
          <Text className="text-typography-700">/{t('form.month')}) *</Text>
        </View>
        <View className={`flex-row items-center bg-background-50 rounded-xl overflow-hidden border ${errors.salary ? 'border-error-500' : 'border-transparent'}`}>
          <View className="px-4 py-3.5 border-r border-background-200">
            <DirhamIcon size={18} color="#6B7280" />
          </View>
          <TextInput
            value={formData.salary}
            onChangeText={(v) => updateFormData({ salary: v })}
            keyboardType="decimal-pad"
            placeholder="2000"
            placeholderTextColor="#9CA3AF"
            textAlign={isRTL ? 'right' : 'left'}
            className="flex-1 px-4 py-3.5 text-base text-typography-900"
          />
        </View>
        {errors.salary && (
          <Text className={`text-error-500 text-sm mt-1 ${isRTL ? 'text-right' : ''}`}>{errors.salary}</Text>
        )}
      </View>

      {/* Office Fees */}
      <View>
        <View className={`flex-row items-center mb-2 gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Text className="text-typography-700 font-medium">
            {isRTL ? 'رسوم المكتب' : 'Office Fees'}
          </Text>
          <Text className="text-typography-700">(</Text>
          <DirhamIcon size={14} color="#374151" />
          <Text className="text-typography-700">)</Text>
        </View>
        <View className={`flex-row items-center bg-background-50 rounded-xl overflow-hidden`}>
          <View className="px-4 py-3.5 border-r border-background-200">
            <DirhamIcon size={18} color="#6B7280" />
          </View>
          <TextInput
            value={formData.officeFees}
            onChangeText={(v) => updateFormData({ officeFees: v })}
            keyboardType="decimal-pad"
            placeholder="5000"
            placeholderTextColor="#9CA3AF"
            textAlign={isRTL ? 'right' : 'left'}
            className="flex-1 px-4 py-3.5 text-base text-typography-900"
          />
        </View>
      </View>
    </View>
  );
}
