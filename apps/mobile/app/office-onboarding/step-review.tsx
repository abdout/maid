import { useState } from 'react';
import { View, Text, Pressable, Image, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { useOfficeForm, EMIRATE_OPTIONS, OFFICE_SCOPE_OPTIONS } from '@/store/office-form';
import { CameraIcon, BuildingIcon, CheckIcon, XIcon } from '@/components/icons';
import { uploadsApi } from '@/lib/api';

export default function StepReview() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { formData, updateFormData } = useOfficeForm();
  const [uploading, setUploading] = useState(false);

  const pickLogo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      setUploading(true);

      try {
        const publicUrl = await uploadsApi.uploadFile(asset.uri, 'logos');
        updateFormData({ logoUrl: publicUrl });
      } catch (uploadError) {
        const msg = uploadError instanceof Error ? uploadError.message : 'Unknown error';
        Alert.alert(
          isRTL ? 'خطأ' : 'Error',
          isRTL ? 'فشل رفع الشعار' : `Upload failed: ${msg}`
        );
      } finally {
        setUploading(false);
      }
    } catch (error) {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    updateFormData({ logoUrl: '' });
  };

  const getEmirateLabel = (emirateId: string) => {
    const emirate = EMIRATE_OPTIONS.find(e => e.id === emirateId);
    if (!emirate) return emirateId;
    return isRTL ? emirate.labelAr : emirate.labelEn;
  };

  const getScopesLabel = () => {
    if (!formData.scopes || formData.scopes.length === 0) return '';
    return formData.scopes.map(scopeId => {
      const scope = OFFICE_SCOPE_OPTIONS.find(s => s.id === scopeId);
      return scope ? (isRTL ? scope.labelAr : scope.labelEn) : scopeId;
    }).join(', ');
  };

  const InfoRow = ({ label, value }: { label: string; value: string }) => {
    if (!value) return null;
    return (
      <View className={`flex-row justify-between py-2 border-b border-background-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Text className="text-typography-500 flex-shrink-0">{label}</Text>
        <Text className={`text-typography-900 font-medium flex-1 ${isRTL ? 'text-left ml-4' : 'text-right mr-4'}`} numberOfLines={1}>
          {value}
        </Text>
      </View>
    );
  };

  return (
    <View className="gap-6">
      {/* Logo Upload */}
      <View className="items-center">
        <Text className={`text-sm font-medium text-typography-700 mb-3 ${isRTL ? 'text-right' : ''} w-full`}>
          {isRTL ? 'شعار المكتب' : 'Office Logo'}
        </Text>

        {formData.logoUrl ? (
          <View className="relative">
            <Image
              source={{ uri: formData.logoUrl }}
              className="w-32 h-32 rounded-2xl"
              resizeMode="cover"
            />
            <Pressable
              onPress={removeLogo}
              className={`absolute -top-2 ${isRTL ? '-left-2' : '-right-2'} w-8 h-8 bg-error-500 rounded-full items-center justify-center`}
            >
              <XIcon size={16} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={pickLogo}
            disabled={uploading}
            className="w-32 h-32 border-2 border-dashed border-background-300 rounded-2xl items-center justify-center bg-background-50"
          >
            {uploading ? (
              <Text className="text-typography-500 text-sm">
                {isRTL ? 'جاري الرفع...' : 'Uploading...'}
              </Text>
            ) : (
              <>
                <CameraIcon size={32} color="#9CA3AF" />
                <Text className="text-typography-500 text-xs mt-2 text-center px-2">
                  {isRTL ? 'أضف شعار' : 'Add logo'}
                </Text>
              </>
            )}
          </Pressable>
        )}
      </View>

      {/* Review Summary */}
      <View className="bg-background-50 rounded-2xl p-4">
        <View className={`flex-row items-center mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <BuildingIcon size={24} color="#FF385C" />
          <Text className={`text-lg font-semibold text-typography-900 ${isRTL ? 'mr-2' : 'ml-2'}`}>
            {isRTL ? 'ملخص المعلومات' : 'Information Summary'}
          </Text>
        </View>

        {/* Basic Info */}
        <View className="mb-4">
          <Text className={`text-sm font-semibold text-primary-500 mb-2 ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'المعلومات الأساسية' : 'Basic Info'}
          </Text>
          <InfoRow label={isRTL ? 'اسم المكتب' : 'Office Name'} value={formData.name} />
          <InfoRow label={isRTL ? 'الهاتف' : 'Phone'} value={formData.phone} />
          <InfoRow label={isRTL ? 'البريد' : 'Email'} value={formData.email} />
          <InfoRow label={isRTL ? 'نوع الخدمات' : 'Services'} value={getScopesLabel()} />
        </View>

        {/* Location */}
        <View className="mb-4">
          <Text className={`text-sm font-semibold text-primary-500 mb-2 ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'الموقع' : 'Location'}
          </Text>
          <InfoRow label={isRTL ? 'الإمارة' : 'Emirate'} value={getEmirateLabel(formData.emirate)} />
          <InfoRow label={isRTL ? 'العنوان' : 'Address'} value={formData.address || formData.addressAr} />
          {formData.googleMapsUrl && (
            <InfoRow label={isRTL ? 'خرائط جوجل' : 'Google Maps'} value="✓" />
          )}
        </View>

        {/* License */}
        <View>
          <Text className={`text-sm font-semibold text-primary-500 mb-2 ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'الترخيص' : 'License'}
          </Text>
          <InfoRow label={isRTL ? 'رقم الرخصة' : 'License #'} value={formData.licenseNumber} />
          <InfoRow label={isRTL ? 'تاريخ الانتهاء' : 'Expiry'} value={formData.licenseExpiry} />
          <InfoRow label={isRTL ? 'الموقع' : 'Website'} value={formData.website} />
          <InfoRow label={isRTL ? 'هاتف المدير' : 'Manager'} value={formData.managerPhone1} />
        </View>
      </View>

      {/* Validation Status */}
      <View className={`flex-row items-center p-4 rounded-xl ${isRTL ? 'flex-row-reverse' : ''} ${formData.name && formData.phone ? 'bg-success-50' : 'bg-warning-50'}`}>
        {formData.name && formData.phone ? (
          <>
            <CheckIcon size={24} color="#10B981" />
            <Text className={`text-success-700 font-medium ${isRTL ? 'mr-2' : 'ml-2'}`}>
              {isRTL ? 'جاهز للتسجيل' : 'Ready to register'}
            </Text>
          </>
        ) : (
          <>
            <XIcon size={24} color="#F59E0B" />
            <Text className={`text-warning-700 font-medium ${isRTL ? 'mr-2' : 'ml-2'}`}>
              {isRTL ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields'}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}
