import { useState } from 'react';
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMaidForm, TOTAL_STEPS, STEP_TITLES, validateStep } from '@/store/maid-form';
import { useCreateMaid, useUpdateMaid, useToast } from '@/hooks';
import { XIcon } from '@/components/icons';
import { StepsOverview, StepFooter } from '@/components/maid-onboarding';

import StepNameNationality from './step-name-nationality';
import StepPersonal from './step-personal';
import StepBackground from './step-background';
import StepServiceType from './step-service-type';
import StepPackage from './step-package';
import StepExperienceNew from './step-experience-new';
import StepSkillsSalary from './step-skills-salary';
import StepLanguages from './step-languages';
import StepPhoto from './step-photo';
import StepContactReview from './step-contact-review';

export default function CreateMaidScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const router = useRouter();
  const toast = useToast();

  const [showOverview, setShowOverview] = useState(true);
  const { currentStep, setStep, nextStep, prevStep, reset, isEditing, editingMaidId, formData, setErrors } = useMaidForm();

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
    // Validate each required field with specific messages
    const missingFields: string[] = [];

    // Step 1 fields: Name & Nationality
    if (!formData.name && !formData.nameAr) {
      missingFields.push(isRTL ? 'الاسم' : 'Name');
    }
    if (!formData.nationalityId) {
      missingFields.push(isRTL ? 'الجنسية' : 'Nationality');
    }

    // Step 4 fields: Service Type
    if (!formData.serviceType) {
      missingFields.push(isRTL ? 'نوع الخدمة' : 'Service Type');
    }

    // Step 7 fields: Skills & Salary
    if (!formData.salary || parseFloat(formData.salary) <= 0) {
      missingFields.push(isRTL ? 'الراتب' : 'Salary');
    }

    // Step 9 fields: Photo
    if (!formData.photoUrl) {
      missingFields.push(isRTL ? 'الصورة' : 'Photo');
    }

    // Step 10 fields: Contact
    if (!formData.whatsappNumber) {
      missingFields.push(isRTL ? 'رقم الواتساب' : 'WhatsApp');
    }
    if (!formData.contactNumber) {
      missingFields.push(isRTL ? 'رقم الاتصال' : 'Contact Number');
    }

    if (missingFields.length > 0) {
      const message = isRTL
        ? `الحقول المطلوبة: ${missingFields.join('، ')}`
        : `Required: ${missingFields.join(', ')}`;
      toast.error(message);
      return;
    }

    const salaryNum = parseFloat(formData.salary);

    // Parse office fees
    const officeFeesNum = formData.officeFees ? parseFloat(formData.officeFees) : null;

    try {
      // Build data object matching the API schema
      const data: Record<string, unknown> = {
        name: formData.name || formData.nameAr,
        nationalityId: formData.nationalityId,
        sex: formData.sex,
        maritalStatus: formData.maritalStatus,
        religion: formData.religion,
        hasChildren: formData.hasChildren,
        education: formData.education,
        // Map serviceType to jobType for API (backward compatibility)
        jobType: formData.serviceType === 'babysitter' ? 'domestic_worker' :
                 formData.serviceType === 'elderly' ? 'nurse_caregiver' : 'domestic_worker',
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
      if (formData.dateOfBirth) {
        data.dateOfBirth = new Date(formData.dateOfBirth).toISOString();
      }
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
        toast.success(t('form.maidUpdated'));
        reset();
        router.back();
      } else {
        await createMaid.mutateAsync(data);
        toast.success(t('form.maidCreated'));
        reset();
        router.back();
      }
    } catch (error: unknown) {
      console.error('Save maid error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`${t('form.saveFailed')}: ${errorMessage}`);
    }
  };

  const handleNext = () => {
    // Validate current step before proceeding
    const stepErrors = validateStep(currentStep, formData, isRTL);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      // Show toast with first error message
      const firstError = Object.values(stepErrors)[0];
      toast.error(firstError || t('validation.fillRequiredFields'));
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

  // Render steps (10 total in 3 phases)
  const renderStep = () => {
    switch (currentStep) {
      // Phase 1: Personal Info
      case 1:
        return <StepNameNationality />;
      case 2:
        return <StepPersonal />;
      case 3:
        return <StepBackground />;
      // Phase 2: Work Info
      case 4:
        return <StepServiceType />;
      case 5:
        return <StepPackage />;
      case 6:
        return <StepExperienceNew />;
      case 7:
        return <StepSkillsSalary />;
      // Phase 3: Documents
      case 8:
        return <StepLanguages />;
      case 9:
        return <StepPhoto />;
      case 10:
        return <StepContactReview />;
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 20, flexGrow: currentStep === 9 ? 1 : undefined }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className={`px-6 ${currentStep === 9 ? 'flex-1' : ''}`}>
            {renderStep()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
