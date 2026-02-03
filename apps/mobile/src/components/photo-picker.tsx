import { useState, useCallback, useEffect } from 'react';
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
  variant?: 'rectangle' | 'circle';
  size?: number;
}

type ImageSource = 'camera' | 'gallery';

export function PhotoPicker({
  value,
  onChange,
  error,
  aspectRatio = [3, 4],
  folder = 'maids',
  placeholder,
  variant = 'rectangle',
  size = 160,
}: PhotoPickerProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [showSourceSheet, setShowSourceSheet] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Version marker to confirm new code is deployed
  useEffect(() => {
    console.log('[PhotoPicker] ====== VERSION 3 LOADED ======');
  }, []);

  // Handle image load errors (e.g., expired S3 URLs, CORS issues)
  const handleImageError = useCallback((e: any) => {
    console.error('[PhotoPicker] Image load FAILED:', {
      displayUri: localUri || value,
      error: e?.nativeEvent?.error || 'Unknown error',
    });
    setImageLoadError(true);
    // Clear local URI if it failed to load
    if (localUri) {
      setLocalUri(null);
    }
  }, [localUri, value]);

  // Handle image load success
  const handleImageLoad = useCallback(() => {
    console.log('[PhotoPicker] Image load SUCCESS:', {
      displayUri: (localUri || value)?.substring(0, 80) + '...',
    });
  }, [localUri, value]);

  // Reset error state when a new image is selected
  const resetImageError = useCallback(() => {
    console.log('[PhotoPicker] Resetting image error state');
    setImageLoadError(false);
  }, []);

  const requestCameraPermission = async (): Promise<boolean> => {
    console.log('[PhotoPicker] Requesting camera permission...');
    const { status: existingStatus } = await ImagePicker.getCameraPermissionsAsync();
    console.log('[PhotoPicker] Existing camera permission:', existingStatus);

    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    console.log('[PhotoPicker] New camera permission:', status);

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
    console.log('[PhotoPicker] Requesting gallery permission...');
    const { status: existingStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();
    console.log('[PhotoPicker] Existing gallery permission:', existingStatus);

    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log('[PhotoPicker] New gallery permission:', status);

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
    console.log('[PhotoPicker] ========== PICK IMAGE START ==========');
    console.log('[PhotoPicker] Source selected:', source);
    setShowSourceSheet(false);

    let result: ImagePicker.ImagePickerResult;

    if (source === 'camera') {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        console.log('[PhotoPicker] Camera permission denied, aborting');
        return;
      }

      console.log('[PhotoPicker] Launching camera...');
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: aspectRatio,
        quality: 0.8,
      });
    } else {
      const hasPermission = await requestGalleryPermission();
      if (!hasPermission) {
        console.log('[PhotoPicker] Gallery permission denied, aborting');
        return;
      }

      console.log('[PhotoPicker] Launching gallery...');
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: aspectRatio,
        quality: 0.8,
      });
    }

    console.log('[PhotoPicker] Picker result:', {
      canceled: result.canceled,
      assetsCount: result.assets?.length || 0,
    });

    if (result.canceled) {
      console.log('[PhotoPicker] User canceled picker');
      return;
    }

    if (!result.assets || !result.assets[0]) {
      console.log('[PhotoPicker] No assets in result');
      return;
    }

    const asset = result.assets[0];
    const uri = asset.uri;

    console.log('[PhotoPicker] ========== IMAGE SELECTED ==========');
    console.log('[PhotoPicker] Asset details:', {
      uri: uri,
      uriLength: uri.length,
      uriStart: uri.substring(0, 100),
      width: asset.width,
      height: asset.height,
      type: asset.type,
      fileSize: asset.fileSize,
      mimeType: asset.mimeType,
      fileName: asset.fileName,
      exif: asset.exif ? 'present' : 'absent',
    });

    console.log('[PhotoPicker] Setting localUri for preview...');
    setLocalUri(uri);

    console.log('[PhotoPicker] Setting isUploading = true');
    setIsUploading(true);
    resetImageError();

    console.log('[PhotoPicker] ========== UPLOAD START ==========');
    console.log('[PhotoPicker] Calling uploadsApi.uploadFile with:', {
      uri: uri.substring(0, 80) + '...',
      folder,
    });

    try {
      const startTime = Date.now();
      const uploadedUrl = await uploadsApi.uploadFile(uri, folder);
      const duration = Date.now() - startTime;

      console.log('[PhotoPicker] ========== UPLOAD SUCCESS ==========');
      console.log('[PhotoPicker] Upload completed in', duration, 'ms');
      console.log('[PhotoPicker] Uploaded URL:', uploadedUrl);
      console.log('[PhotoPicker] Calling onChange with URL...');

      onChange(uploadedUrl);

      console.log('[PhotoPicker] onChange called successfully');
    } catch (uploadError) {
      console.error('[PhotoPicker] ========== UPLOAD FAILED ==========');
      console.error('[PhotoPicker] Error:', uploadError);
      console.error('[PhotoPicker] Error message:', uploadError instanceof Error ? uploadError.message : 'Unknown');
      console.error('[PhotoPicker] Error stack:', uploadError instanceof Error ? uploadError.stack : 'No stack');

      const errorMessage = uploadError instanceof Error ? uploadError.message : '';
      let translationKey = 'upload.failed';

      if (errorMessage.includes('Invalid file type')) {
        translationKey = 'upload.invalidType';
      } else if (errorMessage.includes('too large') || errorMessage.includes('File too large')) {
        translationKey = 'upload.tooLarge';
      } else if (errorMessage.includes('Network') || errorMessage.includes('fetch') || errorMessage.includes('network')) {
        translationKey = 'upload.networkError';
      }

      Alert.alert(t('common.error'), t(translationKey));
      console.log('[PhotoPicker] Clearing localUri due to error');
      setLocalUri(null);
    } finally {
      console.log('[PhotoPicker] Setting isUploading = false');
      setIsUploading(false);
      console.log('[PhotoPicker] ========== PICK IMAGE END ==========');
    }
  };

  const displayUri = localUri || value;

  console.log('[PhotoPicker] Render - displayUri:', displayUri ? displayUri.substring(0, 50) + '...' : null);

  const handleContainerPress = () => {
    console.log('[PhotoPicker] ========== CONTAINER CLICKED ==========');
    console.log('[PhotoPicker] isUploading:', isUploading);
    if (!isUploading) {
      console.log('[PhotoPicker] Opening source sheet modal');
      setShowSourceSheet(true);
    } else {
      console.log('[PhotoPicker] Click ignored - upload in progress');
    }
  };

  return (
    <View>
      <Pressable
        onPress={handleContainerPress}
        disabled={isUploading}
        className="items-center"
      >
        <View
          style={variant === 'circle' ? { width: size, height: size } : { width: 192, height: 256 }}
          className={`bg-background-100 overflow-hidden border-2 border-dashed ${
            variant === 'circle' ? 'rounded-full' : 'rounded-2xl'
          } ${error ? 'border-error-500' : 'border-background-300'}`}
        >
          {isUploading ? (
            <View className="w-full h-full items-center justify-center">
              <ActivityIndicator size="large" color="#FF385C" />
              <Text className="text-typography-500 text-sm mt-2">{t('form.uploading')}</Text>
            </View>
          ) : displayUri && !imageLoadError ? (
            <>
              {console.log('[PhotoPicker] Rendering Image with uri:', displayUri.substring(0, 50) + '...')}
              <Image
                source={{ uri: displayUri }}
                className="w-full h-full"
                resizeMode="cover"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            </>
          ) : imageLoadError ? (
            <View className="w-full h-full items-center justify-center bg-error-50">
              <XIcon size={variant === 'circle' ? 32 : 40} color="#EF4444" />
              <Text className="text-error-500 text-sm mt-2 text-center px-2">
                {isRTL ? 'فشل تحميل الصورة' : 'Image failed to load'}
              </Text>
              <Text className="text-typography-500 text-xs mt-1">
                {isRTL ? 'اضغط لإعادة الاختيار' : 'Tap to re-select'}
              </Text>
            </View>
          ) : (
            placeholder || (
              <View className="w-full h-full items-center justify-center">
                <CameraIcon size={variant === 'circle' ? 40 : 56} color="#9CA3AF" />
                <Text className="text-typography-500 text-sm mt-3">{t('form.addPhoto')}</Text>
                {variant !== 'circle' && (
                  <Text className="text-typography-400 text-xs mt-1">
                    {isRTL ? 'اضغط للاختيار' : 'Tap to select'}
                  </Text>
                )}
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
            onPress={() => {
              console.log('[PhotoPicker] Change Photo clicked');
              setShowSourceSheet(true);
            }}
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
        onShow={() => console.log('[PhotoPicker] Modal shown')}
      >
        <View className="flex-1 justify-end">
          <Pressable
            className="flex-1 bg-black/50"
            onPress={() => {
              console.log('[PhotoPicker] Modal backdrop pressed, closing');
              setShowSourceSheet(false);
            }}
          />

          <View className="bg-background-0 rounded-t-3xl pb-8">
            <View className={`flex-row items-center justify-center px-6 py-4 border-b border-background-100`}>
              <Text className="text-typography-900 font-semibold text-lg">
                {isRTL ? 'اختر مصدر الصورة' : 'Select Photo Source'}
              </Text>
              <Pressable
                onPress={() => {
                  console.log('[PhotoPicker] Modal close button pressed');
                  setShowSourceSheet(false);
                }}
                className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'}`}
              >
                <XIcon size={24} color="#717171" />
              </Pressable>
            </View>

            <View className="px-6 pt-4">
              <Pressable
                onPress={() => {
                  console.log('[PhotoPicker] Camera option selected');
                  handlePickImage('camera');
                }}
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
                onPress={() => {
                  console.log('[PhotoPicker] Gallery option selected');
                  handlePickImage('gallery');
                }}
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
