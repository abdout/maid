import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMaidForm } from '@/store/maid-form';
import { PhotoPicker } from '@/components/photo-picker';

export default function StepPhoto() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { formData, updateFormData, errors } = useMaidForm();

  return (
    <View>
      {/* Profile Photo */}
      <View className="mb-6">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {t('form.profilePhoto')} *
        </Text>
        <Text className={`text-typography-400 text-sm mb-4 ${isRTL ? 'text-right' : ''}`}>
          {isRTL
            ? 'صورة واضحة للوجه مطلوبة للنشر'
            : 'A clear face photo is required for publishing'}
        </Text>

        <PhotoPicker
          value={formData.photoUrl || null}
          onChange={(url) => updateFormData({ photoUrl: url })}
          error={errors.photoUrl}
          aspectRatio={[3, 4]}
          folder="maids"
        />
      </View>
    </View>
  );
}
