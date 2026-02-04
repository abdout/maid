import { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { authApi } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useOfficeForm, TOTAL_STEPS, STEP_TITLES, validateStep } from '@/store/office-form';
import { useRegisterOffice, useToast } from '@/hooks';
import { OfficeStepsOverview, OfficeStepFooter } from '@/components/office-onboarding';

import StepInfo from './step-info';
import StepServices from './step-services';
import StepLocation from './step-location';
import StepLicense from './step-license';
import StepLogo from './step-logo';
import StepReview from './step-review';

export default function OfficeOnboardingScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const router = useRouter();
  const toast = useToast();

  const [showOverview, setShowOverview] = useState(true);
  const { currentStep, setStep, nextStep, prevStep, reset, formData, setErrors, errors } = useOfficeForm();

  const registerOffice = useRegisterOffice();
  const isSubmitting = registerOffice.isPending;

  const handleClose = () => {
    reset();
    router.back();
  };

  const handleGetStarted = () => {
    setShowOverview(false);
    setStep(1);
  };

  const handleBack = () => {
    if (currentStep === 1) {
      setShowOverview(true);
    } else {
      prevStep();
    }
  };

  const handleSubmit = async () => {
    // Final validation - check all required steps
    const step1Errors = validateStep(1, formData, isRTL);
    if (Object.keys(step1Errors).length > 0) {
      setStep(1);
      setTimeout(() => setErrors(step1Errors), 50);
      toast.error(t('validation.fillRequiredFields'));
      return;
    }

    const step2Errors = validateStep(2, formData, isRTL);
    if (Object.keys(step2Errors).length > 0) {
      setStep(2);
      setTimeout(() => setErrors(step2Errors), 50);
      toast.error(t('validation.fillRequiredFields'));
      return;
    }

    try {
      // Build data object - single name field, API auto-translates
      const data: Record<string, unknown> = {
        name: formData.name,
        phone: formData.phone,
        scopes: formData.scopes,
      };

      // Optional fields (nameAr/addressAr not needed - API auto-translates)
      if (formData.email) data.email = formData.email;
      if (formData.address) data.address = formData.address;
      if (formData.emirate) data.emirate = formData.emirate;
      if (formData.googleMapsUrl) data.googleMapsUrl = formData.googleMapsUrl;
      if (formData.licenseNumber) data.licenseNumber = formData.licenseNumber;
      if (formData.licenseExpiry) data.licenseExpiry = formData.licenseExpiry;
      if (formData.licenseImageUrl) data.licenseImageUrl = formData.licenseImageUrl;
      if (formData.website) data.website = formData.website;
      if (formData.managerPhone1) data.managerPhone1 = formData.managerPhone1;
      if (formData.managerPhone2) data.managerPhone2 = formData.managerPhone2;
      if (formData.logoUrl) data.logoUrl = formData.logoUrl;

      console.log('Registering office:', JSON.stringify(data, null, 2));

      await registerOffice.mutateAsync(data);

      // Refresh auth tokens to get updated role/officeId
      const { refreshToken, updateTokens, updateUser } = useAuth.getState();
      if (refreshToken) {
        try {
          const refreshResult = await authApi.refresh(refreshToken);
          if (refreshResult.success && refreshResult.data) {
            await updateTokens({
              accessToken: refreshResult.data.accessToken,
              refreshToken: refreshResult.data.refreshToken,
              expiresIn: refreshResult.data.expiresIn,
            });
            // Also fetch fresh user data
            const meResult = await authApi.getMe();
            if (meResult.success && meResult.data) {
              await updateUser({
                id: meResult.data.id,
                phone: meResult.data.phone,
                email: meResult.data.email,
                name: meResult.data.name,
                role: meResult.data.role as 'customer' | 'office_admin' | 'super_admin',
                officeId: meResult.data.officeId,
                createdAt: new Date(),
              });
            }
          }
        } catch (refreshError) {
          console.warn('Token refresh after registration failed:', refreshError);
          // Continue anyway - user can re-login if needed
        }
      }

      toast.success(t('officeOnboarding.registrationSuccess'));
      reset();
      router.replace('/(office)/maids');
    } catch (error: unknown) {
      console.error('Register office error:', error);

      // Extract error message from various formats
      let errorMessage = isRTL ? 'خطأ غير معروف' : 'Unknown error';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const errObj = error as Record<string, unknown>;
        if (typeof errObj.message === 'string') {
          errorMessage = errObj.message;
        } else if (typeof errObj.error === 'string') {
          errorMessage = errObj.error;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast.error(`${t('officeOnboarding.registrationFailed')}: ${errorMessage}`);
    }
  };

  const handleNext = () => {
    // Validate current step before proceeding
    const stepErrors = validateStep(currentStep, formData, isRTL);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    if (currentStep === TOTAL_STEPS) {
      handleSubmit();
    } else {
      nextStep();
    }
  };

  const stepTitle = STEP_TITLES[currentStep as keyof typeof STEP_TITLES];

  // Render overview screen
  if (showOverview) {
    return (
      <SafeAreaView className="flex-1 bg-background-0" edges={['top', 'bottom']}>
        <Stack.Screen options={{ headerShown: false }} />
        <OfficeStepsOverview onGetStarted={handleGetStarted} />
      </SafeAreaView>
    );
  }

  // Render steps (6 total in 3 phases)
  const renderStep = () => {
    switch (currentStep) {
      // Phase 1: Basic Info
      case 1:
        return <StepInfo />;
      case 2:
        return <StepServices />;
      // Phase 2: Location & License
      case 3:
        return <StepLocation />;
      case 4:
        return <StepLicense />;
      // Phase 3: Logo & Review
      case 5:
        return <StepLogo />;
      case 6:
        return <StepReview />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Step Title */}
      <View className="px-6 pt-4 pb-4">
        <Text className={`text-2xl font-bold text-typography-900 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? stepTitle.ar : stepTitle.en}
        </Text>
        <Text className={`text-sm text-typography-500 mt-1 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? stepTitle.descAr : stepTitle.descEn}
        </Text>
      </View>

      {/* Step Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-6">
            {renderStep()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <OfficeStepFooter
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        onBack={handleBack}
        onNext={handleNext}
        isLoading={isSubmitting}
        showBack={true}
      />
    </SafeAreaView>
  );
}
