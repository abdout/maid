import { View, Text, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useOfficeForm } from '@/store/office-form';

export default function StepLicense() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { formData, updateFormData, errors } = useOfficeForm();

  return (
    <View className="gap-5">
      {/* License Number */}
      <View>
        <Text className={`text-sm font-medium text-typography-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'رقم الرخصة التجارية' : 'Trade License Number'}
        </Text>
        <TextInput
          value={formData.licenseNumber}
          onChangeText={(text) => updateFormData({ licenseNumber: text })}
          placeholder={isRTL ? 'CN-1234567' : 'CN-1234567'}
          placeholderTextColor="#9CA3AF"
          className={`bg-background-50 border border-background-200 rounded-xl px-4 py-3 text-base text-typography-900 ${isRTL ? 'text-right' : ''}`}
        />
      </View>

      {/* License Expiry */}
      <View>
        <Text className={`text-sm font-medium text-typography-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'تاريخ انتهاء الرخصة' : 'License Expiry Date'}
        </Text>
        <TextInput
          value={formData.licenseExpiry}
          onChangeText={(text) => updateFormData({ licenseExpiry: text })}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#9CA3AF"
          className={`bg-background-50 border rounded-xl px-4 py-3 text-base text-typography-900 ${
            errors.licenseExpiry ? 'border-error-500' : 'border-background-200'
          } ${isRTL ? 'text-right' : ''}`}
        />
        {errors.licenseExpiry && (
          <Text className={`text-xs text-error-500 mt-1 ${isRTL ? 'text-right' : ''}`}>
            {errors.licenseExpiry}
          </Text>
        )}
      </View>

      {/* Divider */}
      <View className="h-px bg-background-200 my-1" />

      {/* Manager Phone 1 */}
      <View>
        <Text className={`text-sm font-medium text-typography-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'رقم المدير' : 'Manager Phone'}
        </Text>
        <TextInput
          value={formData.managerPhone1}
          onChangeText={(text) => updateFormData({ managerPhone1: text })}
          placeholder={isRTL ? 'رقم هاتف المدير' : 'Manager phone number'}
          placeholderTextColor="#9CA3AF"
          className={`bg-background-50 border border-background-200 rounded-xl px-4 py-3 text-base text-typography-900 ${isRTL ? 'text-right' : ''}`}
          keyboardType="phone-pad"
        />
      </View>

      {/* Manager Phone 2 */}
      <View>
        <Text className={`text-sm font-medium text-typography-700 mb-2 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'رقم المدير 2 (اختياري)' : 'Manager Phone 2 (Optional)'}
        </Text>
        <TextInput
          value={formData.managerPhone2}
          onChangeText={(text) => updateFormData({ managerPhone2: text })}
          placeholder={isRTL ? 'رقم هاتف إضافي' : 'Additional phone'}
          placeholderTextColor="#9CA3AF"
          className={`bg-background-50 border border-background-200 rounded-xl px-4 py-3 text-base text-typography-900 ${isRTL ? 'text-right' : ''}`}
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );
}
