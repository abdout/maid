import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useOfficeForm, OFFICE_SCOPE_OPTIONS } from '@/store/office-form';

// Descriptions for each scope
const SCOPE_DESCRIPTIONS = {
  recruitment: {
    en: 'Bring workers from abroad',
    ar: 'استقدام عمالة من الخارج',
  },
  leasing: {
    en: 'Workers available locally',
    ar: 'عمالة متوفرة محلياً',
  },
  typing: {
    en: 'Document & visa processing',
    ar: 'معاملات وطباعة',
  },
} as const;

export default function StepServices() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { formData, updateFormData, errors } = useOfficeForm();

  const toggleScope = (scopeId: 'recruitment' | 'leasing' | 'typing') => {
    const currentScopes = formData.scopes;
    const isSelected = currentScopes.includes(scopeId);
    const newScopes = isSelected
      ? currentScopes.filter(s => s !== scopeId)
      : [...currentScopes, scopeId];
    updateFormData({ scopes: newScopes });
  };

  return (
    <View className="pt-8">
      <Text className={`text-typography-500 mb-4 ${isRTL ? 'text-right' : ''}`}>
        {t('officeOnboarding.scopesDescription')}
      </Text>

      {/* Service Type Cards */}
      <View className="gap-3">
        {OFFICE_SCOPE_OPTIONS.map((option) => {
          const isSelected = formData.scopes.includes(option.id);
          const description = SCOPE_DESCRIPTIONS[option.id];

          return (
            <Pressable
              key={option.id}
              onPress={() => toggleScope(option.id)}
              className={`flex-row items-center p-4 rounded-2xl border-2 ${
                isSelected
                  ? 'border-typography-900 bg-background-50'
                  : 'border-background-200 bg-background-0'
              }`}
              style={{ opacity: isSelected ? 1 : 0.6 }}
            >
              {/* Checkbox */}
              <View
                className={`w-6 h-6 rounded-md border-2 items-center justify-center ${
                  isRTL ? 'ml-3' : 'mr-3'
                } ${
                  isSelected
                    ? 'border-typography-900 bg-typography-900'
                    : 'border-background-300'
                }`}
              >
                {isSelected && (
                  <Text className="text-white text-sm font-bold">✓</Text>
                )}
              </View>

              {/* Content */}
              <View className="flex-1">
                <Text
                  className={`text-base font-semibold ${
                    isSelected ? 'text-typography-900' : 'text-typography-700'
                  } ${isRTL ? 'text-right' : ''}`}
                >
                  {isRTL ? option.labelAr : option.labelEn}
                </Text>
                <Text
                  className={`text-sm mt-0.5 ${
                    isSelected ? 'text-typography-600' : 'text-typography-500'
                  } ${isRTL ? 'text-right' : ''}`}
                >
                  {isRTL ? description.ar : description.en}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {errors.scopes && (
        <Text className={`text-xs text-error-500 mt-2 ${isRTL ? 'text-right' : ''}`}>
          {errors.scopes}
        </Text>
      )}

      {/* Info Note */}
      <View className="bg-background-50 rounded-xl p-4 mt-4">
        <Text className={`text-typography-500 text-sm ${isRTL ? 'text-right' : ''}`}>
          {isRTL
            ? 'يمكنك اختيار أكثر من خدمة واحدة'
            : 'You can select multiple services'}
        </Text>
      </View>
    </View>
  );
}
