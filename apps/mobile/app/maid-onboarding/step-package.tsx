import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMaidForm, type PackageType, PACKAGE_TYPE_OPTIONS } from '@/store/maid-form';

// Package type descriptions
const PACKAGE_DESCRIPTIONS = {
  traditional: {
    en: 'Full-time, live-in worker with 2-year contract',
    ar: 'عاملة بدوام كامل وإقامة مع عقد سنتين',
  },
  flexible: {
    en: 'Short-term or temporary arrangement',
    ar: 'ترتيب قصير المدى أو مؤقت',
  },
  hourly: {
    en: 'Pay per hour or day basis',
    ar: 'دفع بالساعة أو باليوم',
  },
} as const;

export default function StepPackage() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { formData, updateFormData, errors } = useMaidForm();

  const handleSelect = (packageType: PackageType) => {
    updateFormData({ packageType });
  };

  return (
    <View>
      <Text className={`text-typography-500 mb-4 ${isRTL ? 'text-right' : ''}`}>
        {isRTL ? 'اختر نوع العقد' : 'Select the contract type'}
      </Text>

      {/* Package Type Cards */}
      <View className="gap-3">
        {PACKAGE_TYPE_OPTIONS.map((option) => {
          const isSelected = formData.packageType === option.id;
          const description = PACKAGE_DESCRIPTIONS[option.id as keyof typeof PACKAGE_DESCRIPTIONS];

          return (
            <Pressable
              key={option.id}
              onPress={() => handleSelect(option.id as PackageType)}
              className={`p-4 rounded-xl border ${
                isSelected
                  ? 'bg-primary-50 border-primary-500'
                  : 'bg-background-0 border-background-200'
              }`}
            >
              <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                {/* Radio Circle */}
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                    isRTL ? 'ml-3' : 'mr-3'
                  } ${
                    isSelected
                      ? 'border-primary-500'
                      : 'border-background-300'
                  }`}
                >
                  {isSelected && (
                    <View className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                  )}
                </View>

                {/* Content */}
                <View className="flex-1">
                  <Text
                    className={`text-base font-medium ${
                      isSelected ? 'text-primary-600' : 'text-typography-900'
                    } ${isRTL ? 'text-right' : ''}`}
                  >
                    {isRTL ? option.labelAr : option.labelEn}
                  </Text>
                  <Text
                    className={`text-sm mt-1 ${
                      isSelected ? 'text-primary-500' : 'text-typography-500'
                    } ${isRTL ? 'text-right' : ''}`}
                  >
                    {isRTL ? description.ar : description.en}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {errors.packageType && (
        <Text className="text-error-500 text-sm mt-2">{errors.packageType}</Text>
      )}

      {/* Info Note */}
      <View className="bg-background-50 rounded-xl p-4 mt-4">
        <Text className={`text-typography-500 text-sm ${isRTL ? 'text-right' : ''}`}>
          {isRTL
            ? 'نوع الباقة يؤثر على طريقة عرض العاملة للعملاء'
            : 'Package type affects how the worker is displayed to customers'}
        </Text>
      </View>
    </View>
  );
}
