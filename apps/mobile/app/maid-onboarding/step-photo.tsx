import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMaidForm } from '@/store/maid-form';
import { PhotoPicker } from '@/components/photo-picker';

export default function StepPhoto() {
  const { t } = useTranslation();
  const { formData, updateFormData, errors } = useMaidForm();

  const handlePhotoChange = (url: string) => {
    updateFormData({ photoUrl: url });
  };

  return (
    <View className="flex-1 items-center">
      {/* Description below step title */}
      <Text className="text-typography-400 text-sm mb-6 text-center max-w-xs px-4">
        {t('form.profilePhotoDescription')}
      </Text>

      <PhotoPicker
        value={formData.photoUrl || null}
        onChange={handlePhotoChange}
        error={errors.photoUrl}
        aspectRatio={[1, 1]}
        folder="maids"
        variant="circle"
        size={240}
      />
    </View>
  );
}
