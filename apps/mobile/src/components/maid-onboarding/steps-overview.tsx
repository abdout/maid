import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { UserIcon, BriefcaseIcon, FileTextIcon } from '@/components/icons';

interface StepsOverviewProps {
  onGetStarted: () => void;
}

const STEPS = [
  {
    number: 1,
    titleEn: 'Tell us about the maid',
    titleAr: 'أخبرنا عن العاملة',
    descriptionEn: 'Share basic details like name, nationality, date of birth, and personal information.',
    descriptionAr: 'شارك التفاصيل الأساسية مثل الاسم والجنسية وتاريخ الميلاد والمعلومات الشخصية.',
    Icon: UserIcon,
  },
  {
    number: 2,
    titleEn: 'Add skills & experience',
    titleAr: 'أضف المهارات والخبرة',
    descriptionEn: 'Include work experience, languages spoken, and salary expectations.',
    descriptionAr: 'أضف خبرة العمل واللغات التي تتحدثها وتوقعات الراتب.',
    Icon: BriefcaseIcon,
  },
  {
    number: 3,
    titleEn: 'Upload documents',
    titleAr: 'ارفع المستندات',
    descriptionEn: 'Add photos and documents to complete the profile and publish.',
    descriptionAr: 'أضف الصور والمستندات لإكمال الملف الشخصي والنشر.',
    Icon: FileTextIcon,
  },
];

export function StepsOverview({ onGetStarted }: StepsOverviewProps) {
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
            {isRTL ? 'من السهل إضافة' : "It's easy to add"}
          </Text>
          <Text className={`text-3xl font-bold text-typography-900 leading-tight ${isRTL ? 'text-right' : ''}`}>
            {isRTL ? 'عاملة جديدة' : 'a new maid'}
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
