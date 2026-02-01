import { View, Text, TextInput, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useOfficeForm, OFFICE_SCOPE_OPTIONS } from '@/store/office-form';

export default function StepBasic() {
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
    <View className="gap-5">
      {/* Office Name (English) */}
      <View>
        <Text className={`text-sm font-medium text-typography-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'اسم المكتب (إنجليزي)' : 'Office Name (English)'} <Text className="text-error-500">*</Text>
        </Text>
        <TextInput
          value={formData.name}
          onChangeText={(text) => updateFormData({ name: text })}
          placeholder={isRTL ? 'مثال: ABC Recruitment' : 'e.g., ABC Recruitment'}
          placeholderTextColor="#9CA3AF"
          className={`bg-background-50 border rounded-xl px-4 py-3 text-typography-900 ${
            errors.name ? 'border-error-500' : 'border-background-200'
          } ${isRTL ? 'text-right' : ''}`}
          autoCapitalize="words"
        />
        {errors.name && (
          <Text className={`text-xs text-error-500 mt-1 ${isRTL ? 'text-right' : ''}`}>
            {errors.name}
          </Text>
        )}
      </View>

      {/* Office Name (Arabic) */}
      <View>
        <Text className={`text-sm font-medium text-typography-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'اسم المكتب (عربي)' : 'Office Name (Arabic)'}
        </Text>
        <TextInput
          value={formData.nameAr}
          onChangeText={(text) => updateFormData({ nameAr: text })}
          placeholder={isRTL ? 'مثال: شركة ABC للتوظيف' : 'e.g., شركة ABC للتوظيف'}
          placeholderTextColor="#9CA3AF"
          className={`bg-background-50 border border-background-200 rounded-xl px-4 py-3 text-typography-900 ${isRTL ? 'text-right' : ''}`}
          textAlign="right"
        />
      </View>

      {/* Phone Number */}
      <View>
        <Text className={`text-sm font-medium text-typography-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'رقم الهاتف' : 'Phone Number'} <Text className="text-error-500">*</Text>
        </Text>
        <TextInput
          value={formData.phone}
          onChangeText={(text) => updateFormData({ phone: text })}
          placeholder={isRTL ? 'مثال: +971501234567' : 'e.g., +971501234567'}
          placeholderTextColor="#9CA3AF"
          className={`bg-background-50 border rounded-xl px-4 py-3 text-typography-900 ${
            errors.phone ? 'border-error-500' : 'border-background-200'
          } ${isRTL ? 'text-right' : ''}`}
          keyboardType="phone-pad"
        />
        {errors.phone && (
          <Text className={`text-xs text-error-500 mt-1 ${isRTL ? 'text-right' : ''}`}>
            {errors.phone}
          </Text>
        )}
      </View>

      {/* Email */}
      <View>
        <Text className={`text-sm font-medium text-typography-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
        </Text>
        <TextInput
          value={formData.email}
          onChangeText={(text) => updateFormData({ email: text })}
          placeholder={isRTL ? 'مثال: info@office.com' : 'e.g., info@office.com'}
          placeholderTextColor="#9CA3AF"
          className={`bg-background-50 border rounded-xl px-4 py-3 text-typography-900 ${
            errors.email ? 'border-error-500' : 'border-background-200'
          } ${isRTL ? 'text-right' : ''}`}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {errors.email && (
          <Text className={`text-xs text-error-500 mt-1 ${isRTL ? 'text-right' : ''}`}>
            {errors.email}
          </Text>
        )}
      </View>

      {/* Office Scopes - Multi-select */}
      <View>
        <Text className={`text-sm font-medium text-typography-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
          {t('officeOnboarding.scopes')} <Text className="text-error-500">*</Text>
        </Text>
        <Text className={`text-xs text-typography-500 mb-3 ${isRTL ? 'text-right' : ''}`}>
          {t('officeOnboarding.scopesDescription')}
        </Text>
        <View className={`flex-row flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {OFFICE_SCOPE_OPTIONS.map((option) => {
            const isSelected = formData.scopes.includes(option.id);
            return (
              <Pressable
                key={option.id}
                onPress={() => toggleScope(option.id)}
                className={`px-4 py-3 rounded-full border ${
                  isSelected ? 'bg-primary-500 border-primary-500' : 'bg-background-0 border-background-200'
                }`}
              >
                <Text className={`font-medium ${isSelected ? 'text-white' : 'text-typography-700'}`}>
                  {isRTL ? option.labelAr : option.labelEn}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {errors.scopes && (
          <Text className={`text-xs text-error-500 mt-2 ${isRTL ? 'text-right' : ''}`}>
            {errors.scopes}
          </Text>
        )}
      </View>
    </View>
  );
}
