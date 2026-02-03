import { View, Text, TextInput, Image, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMaidForm, type MaidStatus } from '@/store/maid-form';

const MAX_BIO_LENGTH = 500;

export default function StepContactReview() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { formData, updateFormData, errors } = useMaidForm();

  // Single-language bio input based on app language
  const handleBioChange = (text: string) => {
    const truncated = text.slice(0, MAX_BIO_LENGTH);
    if (isRTL) {
      updateFormData({ bioAr: truncated });
    } else {
      updateFormData({ bio: truncated });
    }
  };

  const bioValue = isRTL ? formData.bioAr : formData.bio;
  const isPublished = formData.status === 'available';

  const togglePublish = () => {
    const newStatus: MaidStatus = isPublished ? 'inactive' : 'available';
    updateFormData({ status: newStatus });
  };

  return (
    <View>
      {/* Profile Preview */}
      {formData.photoUrl && (
        <View className="items-center mb-4">
          <Image
            source={{ uri: formData.photoUrl }}
            className="w-20 h-20 rounded-full"
          />
          <Text className="text-typography-900 text-lg font-semibold mt-2">
            {formData.name || formData.nameAr}
          </Text>
        </View>
      )}

      {/* WhatsApp Number */}
      <View className="mb-5">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'رقم الواتساب' : 'WhatsApp Number'} *
        </Text>
        <TextInput
          value={formData.whatsappNumber}
          onChangeText={(v) => updateFormData({ whatsappNumber: v })}
          placeholder={isRTL ? '971XXXXXXXXX' : '971XXXXXXXXX'}
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          textAlign={isRTL ? 'right' : 'left'}
          className={`bg-background-50 rounded-xl px-4 py-3.5 text-base text-typography-900 ${
            errors.whatsappNumber ? 'border border-error-500' : ''
          }`}
        />
        {errors.whatsappNumber && (
          <Text className="text-error-500 text-sm mt-1">{errors.whatsappNumber}</Text>
        )}
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
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          textAlign={isRTL ? 'right' : 'left'}
          className={`bg-background-50 rounded-xl px-4 py-3.5 text-base text-typography-900 ${
            errors.contactNumber ? 'border border-error-500' : ''
          }`}
        />
        {errors.contactNumber && (
          <Text className="text-error-500 text-sm mt-1">{errors.contactNumber}</Text>
        )}
      </View>

      {/* CV Reference */}
      <View className="mb-5">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'مرجع السيرة الذاتية' : 'CV Reference'}
        </Text>
        <TextInput
          value={formData.cvReference}
          onChangeText={(v) => updateFormData({ cvReference: v.toUpperCase() })}
          placeholder={isRTL ? 'ABC123' : 'ABC123'}
          placeholderTextColor="#9CA3AF"
          autoCapitalize="characters"
          maxLength={20}
          textAlign={isRTL ? 'right' : 'left'}
          className="bg-background-50 rounded-xl px-4 py-3.5 text-base text-typography-900"
        />
        <Text className={`text-typography-400 text-xs mt-1 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'حروف وأرقام فقط - اختياري' : 'Letters and numbers only - optional'}
        </Text>
      </View>

      {/* Bio - Single field based on language */}
      <View className="mb-5">
        <View className={`flex-row justify-between items-center mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Text className="text-typography-700 font-medium">
            {isRTL ? 'النبذة' : 'Bio'}
          </Text>
          <Text className="text-typography-400 text-xs">
            {bioValue?.length || 0}/{MAX_BIO_LENGTH}
          </Text>
        </View>
        <TextInput
          value={bioValue}
          onChangeText={handleBioChange}
          placeholder={isRTL ? 'نبذة مختصرة عن العاملة...' : 'Brief description about the worker...'}
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={3}
          maxLength={MAX_BIO_LENGTH}
          textAlignVertical="top"
          textAlign={isRTL ? 'right' : 'left'}
          className="bg-background-50 border border-background-200 rounded-xl p-4 text-base text-typography-900 min-h-[80px]"
          style={isRTL ? { writingDirection: 'rtl' } : undefined}
        />
      </View>

      {/* Publish Toggle */}
      <View className="bg-background-50 rounded-2xl p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-4">
            <Text className="text-typography-900 font-semibold text-base">
              {isPublished ? t('form.published') : t('form.unpublished')}
            </Text>
            <Text className="text-typography-500 text-sm mt-1">
              {isPublished
                ? t('form.publishedDescription')
                : t('form.unpublishedDescription')
              }
            </Text>
          </View>
          <Switch
            value={isPublished}
            onValueChange={togglePublish}
            trackColor={{ false: '#E5E7EB', true: '#BBF7D0' }}
            thumbColor={isPublished ? '#22C55E' : '#9CA3AF'}
          />
        </View>
      </View>
    </View>
  );
}
