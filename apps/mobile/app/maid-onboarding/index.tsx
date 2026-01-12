import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Alert, Platform } from 'react-native';

// Cross-platform alert that works on web
const showAlert = (title: string, message: string, buttons?: Array<{text: string, onPress?: () => void}>) => {
  if (Platform.OS === 'web') {
    // Use browser's native alert/confirm on web
    if (buttons && buttons.length > 0 && buttons[0].onPress) {
      if (window.confirm(`${title}\n\n${message}`)) {
        buttons[0].onPress();
      }
    } else {
      window.alert(`${title}\n\n${message}`);
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMaidForm, TOTAL_STEPS, STEP_TITLES } from '@/store/maid-form';
import { useCreateMaid, useUpdateMaid } from '@/hooks';
import { XIcon } from '@/components/icons';
import { StepsOverview, StepFooter } from '@/components/maid-onboarding';

import StepBasic from './step-basic';
import StepJobPackage from './step-job-package';
import StepExperience from './step-experience';
import StepLanguages from './step-languages';
import StepPhoto from './step-photo';
import StepBio from './step-bio';
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
    // Validate required fields
    if (!formData.name || !formData.nationalityId || !formData.dateOfBirth || !formData.salary) {
      showAlert(
        t('common.error'),
        isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields'
      );
      return;
    }

    // Validate photo is required
    if (!formData.photoUrl) {
      showAlert(
        t('common.error'),
        isRTL ? 'يرجى إضافة صورة' : 'Please add a photo'
      );
      return;
    }

    // Validate contact numbers are required
    if (!formData.whatsappNumber || !formData.contactNumber) {
      showAlert(
        t('common.error'),
        isRTL ? 'يرجى إدخال أرقام الاتصال' : 'Please enter contact numbers'
      );
      return;
    }

    // Validate salary is a positive number
    const salaryNum = parseFloat(formData.salary);
    if (isNaN(salaryNum) || salaryNum <= 0) {
      showAlert(
        t('common.error'),
        isRTL ? 'يرجى إدخال راتب صحيح' : 'Please enter a valid salary'
      );
      return;
    }

    // Parse office fees
    const officeFeesNum = formData.officeFees ? parseFloat(formData.officeFees) : null;

    try {
      // Build data object matching the API schema
      const data: Record<string, unknown> = {
        name: formData.name,
        nationalityId: formData.nationalityId,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        sex: formData.sex,
        maritalStatus: formData.maritalStatus,
        religion: formData.religion,
        hasChildren: formData.hasChildren,
        education: formData.education,
        jobType: formData.jobType,
        packageType: formData.packageType,
        experienceYears: formData.experienceYears,
        hasExperience: formData.hasExperience,
        cookingSkills: formData.cookingSkills,
        babySitter: formData.babySitter,
        salary: salaryNum,
        availability: formData.availability,
        photoUrl: formData.photoUrl,
        status: formData.status,
        whatsappNumber: formData.whatsappNumber,
        contactNumber: formData.contactNumber,
      };

      // Only include optional fields if they have values
      if (formData.nameAr) data.nameAr = formData.nameAr;
      if (formData.bio) data.bio = formData.bio;
      if (formData.bioAr) data.bioAr = formData.bioAr;
      if (formData.experienceDetails) data.experienceDetails = formData.experienceDetails;
      if (formData.skillsDetails) data.skillsDetails = formData.skillsDetails;
      if (formData.cvReference) data.cvReference = formData.cvReference;
      if (officeFeesNum && officeFeesNum > 0) data.officeFees = officeFeesNum;
      if (formData.languageIds && formData.languageIds.length > 0) {
        data.languageIds = formData.languageIds;
      }

      console.log('Submitting maid data:', JSON.stringify(data, null, 2));

      if (isEditing && editingMaidId) {
        await updateMaid.mutateAsync({ id: editingMaidId, data });
        showAlert(t('common.success'), t('form.maidUpdated'), [
          { text: t('common.ok'), onPress: () => {
            reset();
            router.back();
          }},
        ]);
      } else {
        await createMaid.mutateAsync(data);
        showAlert(t('common.success'), t('form.maidCreated'), [
          { text: t('common.ok'), onPress: () => {
            reset();
            router.back();
          }},
        ]);
      }
    } catch (error: unknown) {
      console.error('Save maid error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showAlert(
        t('common.error'),
        `${t('form.saveFailed')}\n\n${errorMessage}`
      );
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
      <SafeAreaView className="flex-1 bg-background-0" edges={['top', 'bottom']}>
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

  // Render steps (7 total)
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepBasic />;
      case 2:
        return <StepJobPackage />;
      case 3:
        return <StepExperience />;
      case 4:
        return <StepLanguages />;
      case 5:
        return <StepPhoto />;
      case 6:
        return <StepBio />;
      case 7:
        return <StepReview />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={['top', 'bottom']}>
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
        contentContainerStyle={{ paddingBottom: 20 }}
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
