import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

interface StepFooterProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isLoading?: boolean;
  showBack?: boolean;
}

export function StepFooter({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  nextLabel,
  nextDisabled = false,
  isLoading = false,
  showBack = true,
}: StepFooterProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Calculate progress for 3 sections
  // Steps 1-2 = Section 1, Step 3 = Section 2, Steps 4-5 = Section 3
  const getProgress = (section: number) => {
    if (section === 1) {
      if (currentStep === 1) return 50;
      if (currentStep >= 2) return 100;
      return 0;
    }
    if (section === 2) {
      if (currentStep < 3) return 0;
      if (currentStep === 3) return 100;
      return 100;
    }
    if (section === 3) {
      if (currentStep < 4) return 0;
      if (currentStep === 4) return 50;
      if (currentStep >= 5) return 100;
      return 0;
    }
    return 0;
  };

  const defaultNextLabel = isRTL
    ? (currentStep === totalSteps ? 'نشر' : 'التالي')
    : (currentStep === totalSteps ? 'Publish' : 'Next');

  return (
    <View
      className="bg-background-0 border-t border-background-100"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      {/* Progress Bars */}
      <View className={`flex-row px-6 pt-3 gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {[1, 2, 3].map((section) => (
          <View key={section} className="flex-1 h-1 bg-background-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-typography-900 rounded-full"
              style={{ width: `${getProgress(section)}%` }}
            />
          </View>
        ))}
      </View>

      {/* Navigation Buttons */}
      <View className={`flex-row items-center justify-between px-6 py-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* Back Button */}
        {showBack && currentStep > 1 ? (
          <Pressable
            onPress={onBack}
            className="py-3 px-6"
          >
            <Text className="text-typography-900 font-semibold text-base underline">
              {isRTL ? 'رجوع' : 'Back'}
            </Text>
          </Pressable>
        ) : (
          <View className="py-3 px-6" />
        )}

        {/* Next Button */}
        <Pressable
          onPress={onNext}
          disabled={nextDisabled || isLoading}
          className={`py-3 px-8 rounded-lg ${
            nextDisabled || isLoading ? 'bg-background-300' : 'bg-typography-900'
          }`}
        >
          <Text className={`font-semibold text-base ${
            nextDisabled || isLoading ? 'text-typography-400' : 'text-white'
          }`}>
            {isLoading ? (isRTL ? 'جاري...' : 'Loading...') : (nextLabel || defaultNextLabel)}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
