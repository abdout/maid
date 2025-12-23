import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMaidForm, TOTAL_STEPS, STEP_TITLES } from '@/store/maid-form';
import { useCreateMaid, useUpdateMaid } from '@/hooks';
import { XIcon } from '@/components/icons';
import { StepsOverview, StepFooter } from '@/components/maid-onboarding';

import StepBasic from './step-basic';
import StepExperience from './step-experience';
import StepLanguages from './step-languages';
import StepDocuments from './step-documents';
import StepReview from './step-review';

export default function CreateMaidScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const router = useRouter();

  const [showOverview, setShowOverview] = useState(true);
  const { currentStep, setStep, nextStep, prevStep, reset, isEditing, editingMaidId, formData } = useMaidForm();

  const createMaid = useCreateMaid();
  const updateMaid = useUpdateMaid();
  const isSubmitting = createMaid.isPending || updateMaid.isPending;

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
    try {
      const data = {
        name: formData.name,
        nameAr: formData.nameAr || undefined,
        nationalityId: formData.nationalityId,
        dateOfBirth: new Date(formData.dateOfBirth),
        maritalStatus: formData.maritalStatus,
        religion: formData.religion,
        experienceYears: formData.experienceYears,
        salary: parseFloat(formData.salary),
        languageIds: formData.languageIds,
        photoUrl: formData.photoUrl,
        bio: formData.bio || undefined,
        bioAr: formData.bioAr || undefined,
        status: formData.status,
      };

      if (isEditing && editingMaidId) {
        await updateMaid.mutateAsync({ id: editingMaidId, data });
        Alert.alert(t('common.success'), t('form.maidUpdated'), [
          { text: t('common.ok'), onPress: () => {
            reset();
            router.back();
          }},
        ]);
      } else {
        await createMaid.mutateAsync(data);
        Alert.alert(t('common.success'), t('form.maidCreated'), [
          { text: t('common.ok'), onPress: () => {
            reset();
            router.back();
          }},
        ]);
      }
    } catch (error) {
      console.error('Save maid error:', error);
      Alert.alert(t('common.error'), t('form.saveFailed'));
    }
  };

  const handleNext = () => {
    if (currentStep === TOTAL_STEPS) {
      handleSubmit();
    } else {
      nextStep();
    }
  };

  const stepTitle = STEP_TITLES[currentStep as keyof typeof STEP_TITLES];

  // Render overview screen
  if (showOverview && !isEditing) {
    return (
      <SafeAreaView className="flex-1 bg-background-0" edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />

        {/* Close Button */}
        <View className="px-4 py-3">
          <Pressable
            onPress={handleClose}
            className="w-10 h-10 items-center justify-center"
          >
            <XIcon size={24} color="#222222" />
          </Pressable>
        </View>

        <StepsOverview onGetStarted={handleGetStarted} />
      </SafeAreaView>
    );
  }

  // Render steps
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepBasic />;
      case 2:
        return <StepExperience />;
      case 3:
        return <StepLanguages />;
      case 4:
        return <StepDocuments />;
      case 5:
        return <StepReview />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className={`px-4 py-3 flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Pressable
          onPress={handleClose}
          className="w-10 h-10 items-center justify-center"
        >
          <XIcon size={24} color="#222222" />
        </Pressable>

        <View className="flex-1" />
      </View>

      {/* Step Title */}
      <View className="px-6 pb-4">
        <Text className={`text-2xl font-bold text-typography-900 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? stepTitle.ar : stepTitle.en}
        </Text>
      </View>

      {/* Step Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6">
          {renderStep()}
        </View>
      </ScrollView>

      {/* Footer */}
      <StepFooter
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
