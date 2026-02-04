import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useOfficeForm } from '@/store/office-form';
import { PhotoPicker } from '@/components/photo-picker';

export default function StepLogo() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { formData, updateFormData, errors } = useOfficeForm();

  const handleLogoChange = (url: string) => {
    updateFormData({ logoUrl: url });
  };

  return (
    <View className="flex-1 items-center pt-8">
      <Text className="text-typography-400 text-sm mb-6 text-center max-w-xs px-4">
        {isRTL ? 'أضف شعار مكتبك (اختياري)' : 'Add your office logo (optional)'}
      </Text>

      <PhotoPicker
        value={formData.logoUrl || null}
        onChange={handleLogoChange}
        error={errors.logoUrl}
        aspectRatio={[1, 1]}
        folder="logos"
        variant="circle"
        size={200}
      />
    </View>
  );
}
