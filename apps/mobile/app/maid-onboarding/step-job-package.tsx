import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  useMaidForm,
  type JobType,
  type PackageType,
  JOB_TYPE_OPTIONS,
  PACKAGE_TYPE_OPTIONS,
} from '@/store/maid-form';

export default function StepJobPackage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { formData, updateFormData, errors } = useMaidForm();

  return (
    <View>
      {/* Job Type */}
      <View className="mb-6">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'نوع الوظيفة' : 'Job Type'} *
        </Text>
        <Text className={`text-typography-400 text-sm mb-3 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'اختر نوع العمل' : 'Select the type of work'}
        </Text>
        <View className="gap-3">
          {JOB_TYPE_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => updateFormData({ jobType: option.id as JobType })}
              className={`p-4 rounded-xl border ${
                formData.jobType === option.id
                  ? 'bg-primary-50 border-primary-500'
                  : 'bg-background-0 border-background-200'
              }`}
            >
              <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                    formData.jobType === option.id
                      ? 'border-primary-500'
                      : 'border-background-300'
                  }`}
                >
                  {formData.jobType === option.id && (
                    <View className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                  )}
                </View>
                <Text
                  className={`flex-1 text-base ${
                    formData.jobType === option.id
                      ? 'text-primary-600 font-medium'
                      : 'text-typography-700'
                  } ${isRTL ? 'text-right' : ''}`}
                >
                  {isRTL ? option.labelAr : option.labelEn}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
        {errors.jobType && (
          <Text className="text-error-500 text-sm mt-2">{errors.jobType}</Text>
        )}
      </View>

      {/* Package Type */}
      <View className="mb-6">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'نوع الباقة' : 'Package Type'} *
        </Text>
        <Text className={`text-typography-400 text-sm mb-3 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'اختر نوع العقد' : 'Select the contract type'}
        </Text>
        <View className="gap-3">
          {PACKAGE_TYPE_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => updateFormData({ packageType: option.id as PackageType })}
              className={`p-4 rounded-xl border ${
                formData.packageType === option.id
                  ? 'bg-primary-50 border-primary-500'
                  : 'bg-background-0 border-background-200'
              }`}
            >
              <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${
                    formData.packageType === option.id
                      ? 'border-primary-500'
                      : 'border-background-300'
                  }`}
                >
                  {formData.packageType === option.id && (
                    <View className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                  )}
                </View>
                <Text
                  className={`flex-1 text-base ${
                    formData.packageType === option.id
                      ? 'text-primary-600 font-medium'
                      : 'text-typography-700'
                  } ${isRTL ? 'text-right' : ''}`}
                >
                  {isRTL ? option.labelAr : option.labelEn}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
        {errors.packageType && (
          <Text className="text-error-500 text-sm mt-2">{errors.packageType}</Text>
        )}
      </View>

      {/* Info Note */}
      <View className="bg-background-50 rounded-xl p-4">
        <Text className={`text-typography-500 text-sm ${isRTL ? 'text-right' : ''}`}>
          {isRTL
            ? 'سيتم عرض نوع الوظيفة والباقة للعملاء عند البحث'
            : 'Job type and package will be shown to customers when searching'}
        </Text>
      </View>
    </View>
  );
}
