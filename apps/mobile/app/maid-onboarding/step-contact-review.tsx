import { View, Text, TextInput, Image, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMaidForm, type MaidStatus } from '@/store/maid-form';
import { PhoneIcon, WhatsAppIcon } from '@/components/icons';

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
      {/* Photo Preview - At top, bigger, aligned based on language */}
      {formData.photoUrl && (
        <View className={`mb-6 ${isRTL ? 'items-end' : 'items-start'}`}>
          <Image
            source={{ uri: formData.photoUrl }}
            className="w-28 h-28 rounded-full"
          />
          <Text className={`text-typography-900 text-lg font-semibold mt-3 ${isRTL ? 'text-right' : 'text-left'}`}>
            {formData.name || formData.nameAr}
          </Text>
        </View>
      )}

      {/* WhatsApp Number - with icon prefix */}
      <View className="mb-4">
        <View className={`flex-row items-center bg-background-50 rounded-xl overflow-hidden border ${errors.whatsappNumber ? 'border-error-500' : 'border-background-200'}`}>
          <View className="w-14 h-full items-center justify-center border-r border-background-200 py-3.5">
            <WhatsAppIcon size={20} color="#25D366" />
          </View>
          <TextInput
            value={formData.whatsappNumber}
            onChangeText={(v) => updateFormData({ whatsappNumber: v })}
            placeholder={isRTL ? 'رقم الواتساب' : 'WhatsApp Number'}
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            textAlign={isRTL ? 'right' : 'left'}
            className="flex-1 px-4 py-3.5 text-base text-typography-900"
          />
        </View>
        {errors.whatsappNumber && (
          <Text className="text-error-500 text-sm mt-1">{errors.whatsappNumber}</Text>
        )}
      </View>

      {/* Contact Number - with icon prefix */}
      <View className="mb-4">
        <View className={`flex-row items-center bg-background-50 rounded-xl overflow-hidden border ${errors.contactNumber ? 'border-error-500' : 'border-background-200'}`}>
          <View className="w-14 h-full items-center justify-center border-r border-background-200 py-3.5">
            <PhoneIcon size={20} color="#6B7280" />
          </View>
          <TextInput
            value={formData.contactNumber}
            onChangeText={(v) => updateFormData({ contactNumber: v })}
            placeholder={isRTL ? 'رقم الاتصال' : 'Contact Number'}
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            textAlign={isRTL ? 'right' : 'left'}
            className="flex-1 px-4 py-3.5 text-base text-typography-900"
          />
        </View>
        {errors.contactNumber && (
          <Text className="text-error-500 text-sm mt-1">{errors.contactNumber}</Text>
        )}
      </View>

      {/* CV Reference - with "Ref" text prefix */}
      <View className="mb-4">
        <View className="flex-row items-center bg-background-50 rounded-xl overflow-hidden border border-background-200">
          <View className="w-14 h-full items-center justify-center border-r border-background-200 py-3.5">
            <Text className="text-typography-500 font-medium text-sm">Ref</Text>
          </View>
          <TextInput
            value={formData.cvReference}
            onChangeText={(v) => updateFormData({ cvReference: v.toUpperCase() })}
            placeholder={isRTL ? 'مرجع السيرة الذاتية' : 'CV Reference'}
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
            maxLength={20}
            textAlign={isRTL ? 'right' : 'left'}
            className="flex-1 px-4 py-3.5 text-base text-typography-900"
          />
        </View>
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
