import { View } from 'react-native';
import { useMaidForm } from '@/store/maid-form';
import { PhotoPicker } from '@/components/photo-picker';

export default function StepPhoto() {
  const { formData, updateFormData, errors } = useMaidForm();

  const handlePhotoChange = (url: string) => {
    updateFormData({ photoUrl: url });
  };

  return (
    <View className="flex-1 items-center pt-8">
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
