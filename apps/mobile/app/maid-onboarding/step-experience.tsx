import { View, Text, TextInput, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  useMaidForm,
  type CookingSkill,
  type Availability,
  COOKING_SKILL_OPTIONS,
  AVAILABILITY_OPTIONS,
} from '@/store/maid-form';
import { DirhamIcon } from '@/components/icons';

const MAX_DETAILS_LENGTH = 70;

export default function StepExperience() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { formData, updateFormData, errors } = useMaidForm();

  return (
    <View>
      {/* Has Experience */}
      <View className="mb-5">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'لديها خبرة' : 'Has Experience'} *
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
          numberOfLines={2}
          className={`bg-background-50 rounded-xl px-4 py-3.5 text-typography-900 ${
            isRTL ? 'text-right' : ''
          }`}
        />
        <Text className={`text-typography-400 text-xs mt-1 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'يمكن الكتابة بالعربية أو الإنجليزية' : 'Can be written in Arabic or English'}
        </Text>
      </View>

      {/* Skills Details - 70 chars */}
      <View className="mb-5">
        <View className={`flex-row justify-between items-center mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Text className="text-typography-700 font-medium">
            {isRTL ? 'تفاصيل المهارات' : 'Skills Details'}
          </Text>
          <Text className="text-typography-400 text-xs">
            {formData.skillsDetails?.length || 0}/{MAX_DETAILS_LENGTH}
          </Text>
        </View>
        <TextInput
          value={formData.skillsDetails}
          onChangeText={(text) =>
            updateFormData({ skillsDetails: text.slice(0, MAX_DETAILS_LENGTH) })
          }
          placeholder={isRTL ? 'المهارات والقدرات...' : 'Skills and abilities...'}
          placeholderTextColor="#9CA3AF"
          maxLength={MAX_DETAILS_LENGTH}
          multiline
          numberOfLines={2}
          className={`bg-background-50 rounded-xl px-4 py-3.5 text-typography-900 ${
            isRTL ? 'text-right' : ''
          }`}
        />
      </View>

      {/* Cooking Skills */}
      <View className="mb-5">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'مهارات الطبخ' : 'Cooking Skills'} *
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {COOKING_SKILL_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => updateFormData({ cookingSkills: option.id as CookingSkill })}
              className={`px-4 py-2.5 rounded-full border ${
                formData.cookingSkills === option.id
                  ? 'bg-primary-500 border-primary-500'
                  : 'bg-background-0 border-background-200'
              }`}
            >
              <Text
                className={
                  formData.cookingSkills === option.id
                    ? 'text-white font-medium'
                    : 'text-typography-700'
                }
              >
                {isRTL ? option.labelAr : option.labelEn}
              </Text>
            </Pressable>
          ))}
        </View>
        {errors.cookingSkills && (
          <Text className="text-error-500 text-sm mt-1">{errors.cookingSkills}</Text>
        )}
      </View>

      {/* Baby Sitter */}
      <View className="mb-5">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'رعاية الأطفال' : 'Baby Sitter'}
        </Text>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => updateFormData({ babySitter: true })}
            className={`flex-1 px-4 py-3 rounded-xl border ${
              formData.babySitter === true
                ? 'bg-primary-500 border-primary-500'
                : 'bg-background-0 border-background-200'
            }`}
          >
            <Text
              className={`text-center ${
                formData.babySitter === true
                  ? 'text-white font-medium'
                  : 'text-typography-700'
              }`}
            >
              {t('common.yes')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => updateFormData({ babySitter: false })}
            className={`flex-1 px-4 py-3 rounded-xl border ${
              formData.babySitter === false
                ? 'bg-primary-500 border-primary-500'
                : 'bg-background-0 border-background-200'
            }`}
          >
            <Text
              className={`text-center ${
                formData.babySitter === false
                  ? 'text-white font-medium'
                  : 'text-typography-700'
              }`}
            >
              {t('common.no')}
            </Text>
          </Pressable>
        </View>
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
        <View className="flex-row items-center gap-2">
          <DirhamIcon size={16} color="#6B7280" />
          <TextInput
            value={formData.salary}
            onChangeText={(v) => updateFormData({ salary: v })}
            keyboardType="decimal-pad"
            placeholder="2000"
            className={`flex-1 bg-background-50 rounded-xl px-4 py-3.5 text-typography-900 ${
              errors.salary ? 'border border-error-500' : ''
            }`}
          />
        </View>
        {errors.salary && (
          <Text className="text-error-500 text-sm mt-1">{errors.salary}</Text>
        )}
        <Text className="text-typography-400 text-sm mt-1">
          {t('form.salaryRange')}
        </Text>
      </View>

      {/* Office Fees */}
      <View className="mb-5">
        <View className={`flex-row items-center mb-2 gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Text className="text-typography-700 font-medium">
            {isRTL ? 'رسوم المكتب' : 'Office Fees'}
          </Text>
          <Text className="text-typography-700">(</Text>
          <DirhamIcon size={14} color="#374151" />
          <Text className="text-typography-700">) *</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <DirhamIcon size={16} color="#6B7280" />
          <TextInput
            value={formData.officeFees}
            onChangeText={(v) => updateFormData({ officeFees: v })}
            keyboardType="decimal-pad"
            placeholder="5000"
            className={`flex-1 bg-background-50 rounded-xl px-4 py-3.5 text-typography-900 ${
              errors.officeFees ? 'border border-error-500' : ''
            }`}
          />
        </View>
        {errors.officeFees && (
          <Text className="text-error-500 text-sm mt-1">{errors.officeFees}</Text>
        )}
        <Text className={`text-typography-400 text-sm mt-1 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'شامل ضريبة القيمة المضافة' : 'Inclusive of VAT'}
        </Text>
      </View>

      {/* Availability */}
      <View className="mb-6">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'التواجد' : 'Availability'} *
        </Text>
        <View className="flex-row gap-2">
          {AVAILABILITY_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => updateFormData({ availability: option.id as Availability })}
              className={`flex-1 px-4 py-3 rounded-xl border ${
                formData.availability === option.id
                  ? 'bg-primary-500 border-primary-500'
                  : 'bg-background-0 border-background-200'
              }`}
            >
              <Text
                className={`text-center ${
                  formData.availability === option.id
                    ? 'text-white font-medium'
                    : 'text-typography-700'
                }`}
              >
                {isRTL ? option.labelAr : option.labelEn}
              </Text>
            </Pressable>
          ))}
        </View>
        {errors.availability && (
          <Text className="text-error-500 text-sm mt-1">{errors.availability}</Text>
        )}
      </View>
    </View>
  );
}
