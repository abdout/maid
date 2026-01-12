import { View, Text, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMaidForm } from '@/store/maid-form';

const MAX_BIO_LENGTH = 500;

export default function StepBio() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { formData, updateFormData, errors } = useMaidForm();

  return (
    <View>
      {/* WhatsApp Number */}
      <View className="mb-5">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'رقم الواتساب' : 'WhatsApp Number'} *
        </Text>
        <TextInput
          value={formData.whatsappNumber}
          onChangeText={(v) => updateFormData({ whatsappNumber: v })}
          placeholder={isRTL ? '971XXXXXXXXX' : '971XXXXXXXXX'}
          keyboardType="phone-pad"
          className={`bg-background-50 rounded-xl px-4 py-3.5 text-typography-900 ${
            errors.whatsappNumber ? 'border border-error-500' : ''
          }`}
        />
        {errors.whatsappNumber && (
          <Text className="text-error-500 text-sm mt-1">{errors.whatsappNumber}</Text>
        )}
        <Text className={`text-typography-400 text-xs mt-1 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'للتواصل عبر الواتساب' : 'For WhatsApp communication'}
        </Text>
      </View>

      {/* Contact Number */}
      <View className="mb-5">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'رقم الاتصال' : 'Contact Number'} *
        </Text>
        <TextInput
          value={formData.contactNumber}
          onChangeText={(v) => updateFormData({ contactNumber: v })}
          placeholder={isRTL ? '971XXXXXXXXX' : '971XXXXXXXXX'}
          keyboardType="phone-pad"
          className={`bg-background-50 rounded-xl px-4 py-3.5 text-typography-900 ${
            errors.contactNumber ? 'border border-error-500' : ''
          }`}
        />
        {errors.contactNumber && (
          <Text className="text-error-500 text-sm mt-1">{errors.contactNumber}</Text>
        )}
      </View>

      {/* CV Reference */}
      <View className="mb-6">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'مرجع السيرة الذاتية' : 'CV Reference'}
        </Text>
        <TextInput
          value={formData.cvReference}
          onChangeText={(v) => updateFormData({ cvReference: v.toUpperCase() })}
          placeholder={isRTL ? 'ABC123' : 'ABC123'}
          autoCapitalize="characters"
          maxLength={20}
          className="bg-background-50 rounded-xl px-4 py-3.5 text-typography-900"
        />
        <Text className={`text-typography-400 text-xs mt-1 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'حروف وأرقام فقط - اختياري' : 'Letters and numbers only - optional'}
        </Text>
      </View>

      {/* Divider */}
      <View className="h-px bg-background-200 my-4" />

      {/* English Bio */}
      <View className="mb-6">
        <View className={`flex-row justify-between items-center mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Text className="text-typography-700 font-medium">
            {isRTL ? 'النبذة (إنجليزي)' : 'Bio (English)'}
          </Text>
          <Text className="text-typography-400 text-xs">
            {formData.bio?.length || 0}/{MAX_BIO_LENGTH}
          </Text>
        </View>
        <TextInput
          value={formData.bio}
          onChangeText={(text) => updateFormData({ bio: text.slice(0, MAX_BIO_LENGTH) })}
          placeholder={isRTL ? 'نبذة مختصرة عن الخادمة...' : 'Brief description about the maid...'}
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          maxLength={MAX_BIO_LENGTH}
          textAlignVertical="top"
          className="bg-background-50 border border-background-200 rounded-xl p-4 text-typography-900 min-h-[100px]"
        />
      </View>

      {/* Arabic Bio */}
      <View className="mb-6">
        <View className={`flex-row justify-between items-center mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Text className="text-typography-700 font-medium">
            {isRTL ? 'النبذة (عربي)' : 'Bio (Arabic)'}
          </Text>
          <Text className="text-typography-400 text-xs">
            {formData.bioAr?.length || 0}/{MAX_BIO_LENGTH}
          </Text>
        </View>
        <TextInput
          value={formData.bioAr}
          onChangeText={(text) => updateFormData({ bioAr: text.slice(0, MAX_BIO_LENGTH) })}
          placeholder="نبذة مختصرة بالعربية..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          maxLength={MAX_BIO_LENGTH}
          textAlignVertical="top"
          textAlign="right"
          className="bg-background-50 border border-background-200 rounded-xl p-4 text-typography-900 min-h-[100px]"
          style={{ writingDirection: 'rtl' }}
        />
      </View>

      {/* Optional Note */}
      <View className="bg-background-50 rounded-xl p-4">
        <Text className={`text-typography-500 text-sm ${isRTL ? 'text-right' : ''}`}>
          {isRTL
            ? 'النبذة اختيارية لكنها تساعد العملاء على معرفة المزيد عن الخادمة'
            : 'Bio is optional but helps customers learn more about the maid'}
        </Text>
      </View>
    </View>
  );
}
