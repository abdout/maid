import { View, Text, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useOfficeForm } from '@/store/office-form';

export default function StepInfo() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { formData, updateFormData, errors } = useOfficeForm();

  // Single name field - user enters in their preferred language
  // API auto-translates to the other language
  const handleNameChange = (text: string) => {
    updateFormData({ name: text });
  };

  return (
    <View className="gap-5 pt-8">
      {/* Office Name - Single field based on language */}
      <View>
        <Text className={`text-sm font-medium text-typography-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'اسم المكتب' : 'Office Name'} <Text className="text-error-500">*</Text>
        </Text>
        <TextInput
          value={formData.name}
          onChangeText={handleNameChange}
          placeholder={isRTL ? 'تدبير للتوظيف' : 'Tadbeer Recruitment'}
          placeholderTextColor="#9CA3AF"
          className={`bg-background-50 border rounded-xl px-4 py-3 text-base text-typography-900 ${
            errors.name ? 'border-error-500' : 'border-background-200'
          } ${isRTL ? 'text-right' : ''}`}
          autoCapitalize="words"
          textAlign={isRTL ? 'right' : 'left'}
        />
        {errors.name && (
          <Text className={`text-xs text-error-500 mt-1 ${isRTL ? 'text-right' : ''}`}>
            {errors.name}
          </Text>
        )}
        <Text className={`text-xs text-typography-400 mt-1 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'سيتم ترجمة الاسم تلقائياً' : 'Will be auto-translated'}
        </Text>
      </View>

      {/* Phone Number */}
      <View>
        <Text className={`text-sm font-medium text-typography-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'رقم الهاتف' : 'Phone Number'} <Text className="text-error-500">*</Text>
        </Text>
        <TextInput
          value={formData.phone}
          onChangeText={(text) => updateFormData({ phone: text })}
          placeholder={isRTL ? '+971501234567' : '+971501234567'}
          placeholderTextColor="#9CA3AF"
          className={`bg-background-50 border rounded-xl px-4 py-3 text-base text-typography-900 ${
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
          placeholder={isRTL ? 'info@office.com' : 'info@office.com'}
          placeholderTextColor="#9CA3AF"
          className={`bg-background-50 border rounded-xl px-4 py-3 text-base text-typography-900 ${
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
    </View>
  );
}
