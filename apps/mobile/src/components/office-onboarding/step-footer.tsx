import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';

interface OfficeStepFooterProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isLoading?: boolean;
  showBack?: boolean;
}

export function OfficeStepFooter({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  nextLabel,
  nextDisabled = false,
  isLoading = false,
  showBack = true,
}: OfficeStepFooterProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Calculate progress for 3 phases with 6 total steps
  // Phase 1 (Basic Info): Steps 1-2
  // Phase 2 (Location & License): Steps 3-4
  // Phase 3 (Logo & Review): Steps 5-6
  const getProgress = (phase: number) => {
    if (phase === 1) {
      // Steps 1-2
      if (currentStep >= 2) return 100;
      return (currentStep / 2) * 100;
    }
    if (phase === 2) {
      // Steps 3-4
      if (currentStep < 3) return 0;
      if (currentStep >= 4) return 100;
      return ((currentStep - 2) / 2) * 100;
    }
    if (phase === 3) {
      // Steps 5-6
      if (currentStep < 5) return 0;
      if (currentStep >= 6) return 100;
      return ((currentStep - 4) / 2) * 100;
    }
    return 0;
  };

  const defaultNextLabel = isRTL
    ? (currentStep === totalSteps ? 'تسجيل' : 'التالي')
    : (currentStep === totalSteps ? 'Register' : 'Next');

  return (
    <View className="bg-background-0">
      {/* Progress Bars - 3 phases */}
      <View className={`flex-row px-6 pt-3 gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {[1, 2, 3].map((phase) => (
          <View
            key={phase}
            className="flex-1 h-1 bg-background-200 rounded-full overflow-hidden"
            style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
          >
            <View
              className="h-full bg-typography-900 rounded-full"
              style={{ width: `${getProgress(phase)}%` }}
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
          className={`py-3 px-8 rounded-lg flex-row items-center gap-2 ${
            nextDisabled || isLoading ? 'bg-background-300' : 'bg-typography-900'
          }`}
        >
          {isLoading && (
            <ActivityIndicator size="small" color="#fff" />
          )}
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
