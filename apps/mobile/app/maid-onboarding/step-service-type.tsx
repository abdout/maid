import { View, Text, Pressable, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMaidForm, type ServiceType, SERVICE_TYPE_OPTIONS } from '@/store/maid-form';

// Service type icon images (matching filter modal)
const serviceTypeImages = {
  wipe: require('../../assets/wipe.png'),
  'chef-hat': require('../../assets/chef-hat.png'),
  'baby-stroller': require('../../assets/baby-stroller.png'),
  'old-people': require('../../assets/old-people.png'),
} as const;

export default function StepServiceType() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { formData, updateFormData, errors } = useMaidForm();

  const handleSelect = (serviceType: ServiceType) => {
    updateFormData({ serviceType });
  };

  return (
    <View className="pt-4">
      <Text className={`text-typography-500 mb-4 ${isRTL ? 'text-right' : ''}`}>
        {isRTL ? 'اختر نوع الخدمة الرئيسي' : 'Select the main service type'}
      </Text>

      {/* Service Type Cards - 2x2 Grid */}
      <View className="flex-row flex-wrap justify-between">
        {SERVICE_TYPE_OPTIONS.map((type) => {
          const isSelected = formData.serviceType === type.id;
          return (
            <Pressable
              key={type.id}
              onPress={() => handleSelect(type.id)}
              className={`w-[48%] items-center py-6 mb-4 rounded-2xl ${
                isSelected ? 'border-2 border-typography-900 bg-background-50' : 'border border-background-200 bg-background-0'
              }`}
              style={{ opacity: isSelected ? 1 : 0.6 }}
            >
              <Image
                source={serviceTypeImages[type.image as keyof typeof serviceTypeImages]}
                style={{ width: 48, height: 48 }}
                resizeMode="contain"
              />
              <Text className={`text-base font-medium mt-3 text-typography-900 ${isRTL ? 'text-right' : ''}`}>
                {isRTL ? type.labelAr : type.labelEn}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {errors.serviceType && (
        <Text className="text-error-500 text-sm mt-2">{errors.serviceType}</Text>
      )}

      {/* Info Note */}
      <View className="bg-background-50 rounded-xl p-4 mt-4">
        <Text className={`text-typography-500 text-sm ${isRTL ? 'text-right' : ''}`}>
          {isRTL
            ? 'يمكن للعاملة تقديم خدمات متعددة - هذا هو النوع الرئيسي'
            : 'The worker can provide multiple services - this is the main type'}
        </Text>
      </View>
    </View>
  );
}
