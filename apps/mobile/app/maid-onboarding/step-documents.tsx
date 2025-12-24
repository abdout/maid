import { useState } from 'react';
import { View, Text, Pressable, Image, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { useMaidForm } from '@/store/maid-form';
import { uploadsApi } from '@/lib/api';
import { CameraIcon, PlusIcon, XIcon } from '@/components/icons';

export default function StepDocuments() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { formData, updateFormData, errors } = useMaidForm();
  const [isUploading, setIsUploading] = useState<'main' | 'additional' | 'passport' | null>(null);

  const handlePickMainPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUploading('main');
      try {
        const uploadedUrl = await uploadsApi.uploadFile(result.assets[0].uri, 'maids');
        updateFormData({ photoUrl: uploadedUrl });
      } catch (error) {
        console.error('Upload error:', error);
        Alert.alert(t('common.error'), t('form.uploadFailed'));
      } finally {
        setIsUploading(null);
      }
    }
  };

  const handlePickAdditionalPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUploading('additional');
      try {
        const uploadedUrl = await uploadsApi.uploadFile(result.assets[0].uri, 'maids');
        const currentPhotos = formData.additionalPhotos || [];
        updateFormData({ additionalPhotos: [...currentPhotos, uploadedUrl] });
      } catch (error) {
        console.error('Upload error:', error);
        Alert.alert(t('common.error'), t('form.uploadFailed'));
      } finally {
        setIsUploading(null);
      }
    }
  };

  const handlePickPassport = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUploading('passport');
      try {
        const uploadedUrl = await uploadsApi.uploadFile(result.assets[0].uri, 'documents');
        updateFormData({ passportUrl: uploadedUrl });
      } catch (error) {
        console.error('Upload error:', error);
        Alert.alert(t('common.error'), t('form.uploadFailed'));
      } finally {
        setIsUploading(null);
      }
    }
  };

  const removeAdditionalPhoto = (index: number) => {
    const currentPhotos = formData.additionalPhotos || [];
    updateFormData({
      additionalPhotos: currentPhotos.filter((_, i) => i !== index),
    });
  };

  return (
    <View>
        {/* Main Profile Photo */}
        <View className="mb-6">
          <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
            {t('form.profilePhoto')} *
          </Text>
          <Pressable
            onPress={handlePickMainPhoto}
            disabled={isUploading === 'main'}
            className="items-center"
          >
            <View className="w-40 h-52 bg-background-100 rounded-2xl overflow-hidden border-2 border-dashed border-background-300">
              {isUploading === 'main' ? (
                <View className="w-full h-full items-center justify-center">
                  <ActivityIndicator size="large" color="#FF385C" />
                  <Text className="text-typography-500 text-sm mt-2">{t('form.uploading')}</Text>
                </View>
              ) : formData.photoUrl ? (
                <Image source={{ uri: formData.photoUrl }} className="w-full h-full" />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <CameraIcon size={48} color="#9CA3AF" />
                  <Text className="text-typography-500 text-sm mt-2">{t('form.addPhoto')}</Text>
                </View>
              )}
            </View>
          </Pressable>
          {formData.photoUrl && (
            <Text className="text-success-500 text-center text-sm mt-2">
              ✓ {t('form.photoUploaded')}
            </Text>
          )}
          {errors.photoUrl && (
            <Text className="text-error-500 text-center text-sm mt-1">{errors.photoUrl}</Text>
          )}
        </View>

        {/* Additional Photos */}
        <View className="mb-6">
          <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
            {t('form.additionalPhotos')}
          </Text>
          <Text className={`text-typography-400 text-sm mb-3 ${isRTL ? 'text-right' : ''}`}>
            {t('form.additionalPhotosDescription')}
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {formData.additionalPhotos?.map((photo, index) => (
              <View key={index} className="relative">
                <Image
                  source={{ uri: photo }}
                  className="w-24 h-24 rounded-xl"
                />
                <Pressable
                  onPress={() => removeAdditionalPhoto(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-error-500 rounded-full items-center justify-center"
                >
                  <XIcon size={14} color="white" />
                </Pressable>
              </View>
            ))}
            {(formData.additionalPhotos?.length || 0) < 5 && (
              <Pressable
                onPress={handlePickAdditionalPhoto}
                disabled={isUploading === 'additional'}
                className="w-24 h-24 bg-background-100 rounded-xl border-2 border-dashed border-background-300 items-center justify-center"
              >
                {isUploading === 'additional' ? (
                  <ActivityIndicator size="small" color="#FF385C" />
                ) : (
                  <PlusIcon size={32} color="#9CA3AF" />
                )}
              </Pressable>
            )}
          </View>
        </View>

        {/* Passport Copy */}
        <View className="mb-5">
          <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
            {t('form.passportCopy')}
          </Text>
          <Text className={`text-typography-400 text-sm mb-3 ${isRTL ? 'text-right' : ''}`}>
            {t('form.passportDescription')}
          </Text>
          <Pressable
            onPress={handlePickPassport}
            disabled={isUploading === 'passport'}
            className="bg-background-100 rounded-xl p-4 border-2 border-dashed border-background-300"
          >
            {isUploading === 'passport' ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#FF385C" />
                <Text className="text-typography-500 text-sm mt-2">{t('form.uploading')}</Text>
              </View>
            ) : formData.passportUrl ? (
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-success-100 rounded-lg items-center justify-center mr-3">
                    <Text className="text-success-600">✓</Text>
                  </View>
                  <Text className="text-typography-700">{t('form.passportUploaded')}</Text>
                </View>
                <Pressable
                  onPress={() => updateFormData({ passportUrl: '' })}
                  className="p-2"
                >
                  <XIcon size={20} color="#EF4444" />
                </Pressable>
              </View>
            ) : (
              <View className="items-center py-4">
                <PlusIcon size={32} color="#9CA3AF" />
                <Text className="text-typography-500 text-sm mt-2">
                  {t('form.uploadPassport')}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
    </View>
  );
}
