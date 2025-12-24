import { useState } from 'react';
import { View, Text, Pressable, Image, ActivityIndicator, Alert, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { CameraIcon, GalleryIcon, XIcon } from '@/components/icons';
import { uploadsApi } from '@/lib/api';

interface PhotoPickerProps {
  value: string | null;
  onChange: (url: string) => void;
  onRemove?: () => void;
  error?: string;
  aspectRatio?: [number, number];
  folder?: 'maids' | 'documents' | 'logos';
  placeholder?: React.ReactNode;
}

type ImageSource = 'camera' | 'gallery';

export function PhotoPicker({
  value,
  onChange,
  error,
  aspectRatio = [3, 4],
  folder = 'maids',
  placeholder,
}: PhotoPickerProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [showSourceSheet, setShowSourceSheet] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localUri, setLocalUri] = useState<string | null>(null);

  const requestCameraPermission = async (): Promise<boolean> => {
    const { status: existingStatus } = await ImagePicker.getCameraPermissionsAsync();

    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        isRTL ? 'الإذن مطلوب' : 'Permission Required',
        isRTL
          ? 'يرجى السماح بالوصول إلى الكاميرا في الإعدادات'
          : 'Please allow camera access in settings to take photos',
        [{ text: t('common.ok') }]
      );
      return false;
    }

    return true;
  };

  const requestGalleryPermission = async (): Promise<boolean> => {
    const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();

    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        isRTL ? 'الإذن مطلوب' : 'Permission Required',
        isRTL
          ? 'يرجى السماح بالوصول إلى الصور في الإعدادات'
          : 'Please allow photo library access in settings',
        [{ text: t('common.ok') }]
      );
      return false;
    }

    return true;
  };

  const handlePickImage = async (source: ImageSource) => {
    setShowSourceSheet(false);

    let result: ImagePicker.ImagePickerResult;

    if (source === 'camera') {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return;

      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: aspectRatio,
        quality: 0.8,
      });
    } else {
      const hasPermission = await requestGalleryPermission();
      if (!hasPermission) return;

      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: aspectRatio,
        quality: 0.8,
      });
    }

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setLocalUri(uri);
      setIsUploading(true);

      try {
        const uploadedUrl = await uploadsApi.uploadFile(uri, folder);
        onChange(uploadedUrl);
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        Alert.alert(t('common.error'), t('form.uploadFailed'));
        setLocalUri(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const displayUri = localUri || value;

  return (
    <View>
      <Pressable
        onPress={() => setShowSourceSheet(true)}
        disabled={isUploading}
        className="items-center"
      >
        <View className={`w-48 h-64 bg-background-100 rounded-2xl overflow-hidden border-2 border-dashed ${
          error ? 'border-error-500' : 'border-background-300'
        }`}>
          {isUploading ? (
            <View className="w-full h-full items-center justify-center">
              <ActivityIndicator size="large" color="#FF385C" />
              <Text className="text-typography-500 text-sm mt-2">{t('form.uploading')}</Text>
            </View>
          ) : displayUri ? (
            <Image
              source={{ uri: displayUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            placeholder || (
              <View className="w-full h-full items-center justify-center">
                <CameraIcon size={56} color="#9CA3AF" />
                <Text className="text-typography-500 text-sm mt-3">{t('form.addPhoto')}</Text>
                <Text className="text-typography-400 text-xs mt-1">
                  {isRTL ? 'اضغط للاختيار' : 'Tap to select'}
                </Text>
              </View>
            )
          )}
        </View>
      </Pressable>

      {value && !isUploading && (
        <View className="items-center mt-3">
          <Text className="text-success-500 text-sm">
            {t('form.photoUploaded')}
          </Text>
          <Pressable
            onPress={() => setShowSourceSheet(true)}
            className="mt-2"
          >
            <Text className="text-primary-500 text-sm font-medium">
              {isRTL ? 'تغيير الصورة' : 'Change Photo'}
            </Text>
          </Pressable>
        </View>
      )}

      {error && (
        <Text className="text-error-500 text-center text-sm mt-2">{error}</Text>
      )}

      <Modal
        visible={showSourceSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSourceSheet(false)}
      >
        <View className="flex-1 justify-end">
          <Pressable
            className="flex-1 bg-black/50"
            onPress={() => setShowSourceSheet(false)}
          />

          <View className="bg-background-0 rounded-t-3xl pb-8">
            <View className={`flex-row items-center justify-center px-6 py-4 border-b border-background-100`}>
              <Text className="text-typography-900 font-semibold text-lg">
                {isRTL ? 'اختر مصدر الصورة' : 'Select Photo Source'}
              </Text>
              <Pressable
                onPress={() => setShowSourceSheet(false)}
                className="absolute right-4 top-4"
              >
                <XIcon size={24} color="#717171" />
              </Pressable>
            </View>

            <View className="px-6 pt-4">
              <Pressable
                onPress={() => handlePickImage('camera')}
                className={`flex-row items-center py-4 px-4 bg-background-50 rounded-xl mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center">
                  <CameraIcon size={24} color="#FF385C" />
                </View>
                <View className={`flex-1 ${isRTL ? 'mr-4 items-end' : 'ml-4'}`}>
                  <Text className="text-typography-900 font-semibold text-base">
                    {isRTL ? 'التقاط صورة' : 'Take Photo'}
                  </Text>
                  <Text className="text-typography-500 text-sm mt-0.5">
                    {isRTL ? 'استخدم الكاميرا' : 'Use camera'}
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={() => handlePickImage('gallery')}
                className={`flex-row items-center py-4 px-4 bg-background-50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <View className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center">
                  <GalleryIcon size={24} color="#6366F1" />
                </View>
                <View className={`flex-1 ${isRTL ? 'mr-4 items-end' : 'ml-4'}`}>
                  <Text className="text-typography-900 font-semibold text-base">
                    {isRTL ? 'اختيار من المعرض' : 'Choose from Gallery'}
                  </Text>
                  <Text className="text-typography-500 text-sm mt-0.5">
                    {isRTL ? 'اختر صورة موجودة' : 'Select existing photo'}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
