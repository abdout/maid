import { View, Text, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useOfficeForm, EMIRATE_OPTIONS, OFFICE_SCOPE_OPTIONS } from '@/store/office-form';
import { CheckIcon, XIcon } from '@/components/icons';

export default function StepReview() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { formData } = useOfficeForm();

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

  return (
    <View className="gap-4 pt-8">
      {/* Twitter-style Profile Header */}
      <View className={`flex-row items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* Logo Circle */}
        {formData.logoUrl ? (
          <Image
            source={{ uri: formData.logoUrl }}
            className="w-20 h-20 rounded-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-20 h-20 rounded-full bg-background-100 items-center justify-center">
            <Text className="text-3xl">🏢</Text>
          </View>
        )}

        {/* Basic Info */}
        <View className="flex-1">
          <Text className={`text-xl font-bold text-typography-900 ${isRTL ? 'text-right' : ''}`}>
            {formData.name || (isRTL ? 'اسم المكتب' : 'Office Name')}
          </Text>
          <Text className={`text-sm text-typography-500 ${isRTL ? 'text-right' : ''}`}>
            {formData.phone || (isRTL ? 'رقم الهاتف' : 'Phone number')}
          </Text>
          {formData.email && (
            <Text className={`text-sm text-typography-500 ${isRTL ? 'text-right' : ''}`}>
              {formData.email}
            </Text>
          )}
        </View>
      </View>

      {/* Rest of Info - Simple list */}
      <View className="bg-background-50 rounded-xl p-4 gap-3">
        <InfoRow label={isRTL ? 'الخدمات' : 'Services'} value={getScopesLabel()} isRTL={isRTL} />
        <InfoRow label={isRTL ? 'الإمارة' : 'Emirate'} value={getEmirateLabel(formData.emirate)} isRTL={isRTL} />
        <InfoRow label={isRTL ? 'العنوان' : 'Address'} value={formData.address || formData.addressAr} isRTL={isRTL} />
        <InfoRow label={isRTL ? 'رقم الرخصة' : 'License'} value={formData.licenseNumber} isRTL={isRTL} />
        <InfoRow label={isRTL ? 'تاريخ الانتهاء' : 'Expiry'} value={formData.licenseExpiry} isRTL={isRTL} />
        <InfoRow label={isRTL ? 'هاتف المدير' : 'Manager'} value={formData.managerPhone1} isRTL={isRTL} />
      </View>

      {/* Validation Status */}
      <View className={`flex-row items-center p-4 rounded-xl ${isRTL ? 'flex-row-reverse' : ''} ${
        formData.name && formData.phone ? 'bg-success-50' : 'bg-warning-50'
      }`}>
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

function InfoRow({ label, value, isRTL }: { label: string; value: string; isRTL: boolean }) {
  if (!value) return null;
  return (
    <View className={`flex-row justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
      <Text className="text-typography-500">{label}</Text>
      <Text className={`text-typography-900 font-medium ${isRTL ? 'text-left' : 'text-right'}`}>
        {value}
      </Text>
    </View>
  );
}
