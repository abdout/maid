import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BuildingIcon, MapPinIcon, FileTextIcon } from '@/components/icons';

interface OfficeStepsOverviewProps {
  onGetStarted: () => void;
}

const STEPS = [
  {
    number: 1,
    titleEn: 'Basic Info',
    titleAr: 'المعلومات الأساسية',
    descriptionEn: 'Office name, phone, email, and select your services.',
    descriptionAr: 'اسم المكتب والهاتف والبريد واختيار الخدمات.',
    Icon: BuildingIcon,
  },
  {
    number: 2,
    titleEn: 'Location & License',
    titleAr: 'الموقع والترخيص',
    descriptionEn: 'Emirate, address, license details, and manager contacts.',
    descriptionAr: 'الإمارة والعنوان وتفاصيل الرخصة وأرقام المدير.',
    Icon: MapPinIcon,
  },
  {
    number: 3,
    titleEn: 'Review & Logo',
    titleAr: 'المراجعة والشعار',
    descriptionEn: 'Upload your office logo and review information.',
    descriptionAr: 'ارفع شعار المكتب وراجع المعلومات.',
    Icon: FileTextIcon,
  },
];

export function OfficeStepsOverview({ onGetStarted }: OfficeStepsOverviewProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <View className="flex-1 bg-background-0">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-12 pb-8">
          <Text className={`text-3xl font-bold text-typography-900 leading-tight ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'سجّل مكتبك' : 'Register your'}
          </Text>
          <Text className={`text-3xl font-bold text-typography-900 leading-tight ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'في دقائق' : 'office easily'}
          </Text>
        </View>

        {/* Steps */}
        <View className="px-6">
          {STEPS.map((step, index) => (
            <View
              key={step.number}
              className={`flex-row items-start py-6 ${index < STEPS.length - 1 ? 'border-b border-background-100' : ''} ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              {/* Step Number */}
              <View className={`w-8 ${isRTL ? 'ml-4' : 'mr-4'}`}>
                <Text className="text-xl font-semibold text-typography-900">
                  {step.number}
                </Text>
              </View>

              {/* Content */}
              <View className="flex-1">
                <Text className={`text-lg font-semibold text-typography-900 mb-1 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? step.titleAr : step.titleEn}
                </Text>
                <Text className={`text-typography-500 leading-6 ${isRTL ? 'text-right' : ''}`}>
                  {isRTL ? step.descriptionAr : step.descriptionEn}
                </Text>
              </View>

              {/* Icon */}
              <View className={`w-16 h-16 items-center justify-center ${isRTL ? 'mr-4' : 'ml-4'}`}>
                <step.Icon size={40} color="#FF385C" />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-background-0 border-t border-background-100"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Pressable
          onPress={onGetStarted}
          className="w-full py-4 bg-primary-500 rounded-xl items-center"
        >
          <Text className="text-white font-semibold text-base">
            {isRTL ? 'ابدأ الآن' : 'Get started'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
