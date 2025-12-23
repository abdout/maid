import { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMaid } from '@/hooks';
import { useMaidForm, type MaidFormData } from '@/store/maid-form';

// Import the create-maid screen components
import CreateMaidScreen from '../create-maid';

export default function EditMaidScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();

  const { data: maidData, isLoading, error } = useMaid(id || '');
  const { initializeForEdit, isEditing } = useMaidForm();

  useEffect(() => {
    if (maidData?.data?.maid && !isEditing) {
      const maid = maidData.data.maid;
      const languages = maidData.data.languages || [];

      const formData: Partial<MaidFormData> = {
        name: maid.name,
        nameAr: maid.nameAr || '',
        nationalityId: maid.nationalityId || '',
        dateOfBirth: maid.dateOfBirth?.split('T')[0] || '',
        maritalStatus: maid.maritalStatus as MaidFormData['maritalStatus'],
        religion: maid.religion as MaidFormData['religion'],
        experienceYears: maid.experienceYears || 0,
        salary: maid.salary?.toString() || '',
        skills: [], // Skills might need to be loaded separately
        languageIds: languages.map((l) => l.id),
        photoUrl: maid.photoUrl || '',
        additionalPhotos: [], // Additional photos might be stored in documents
        passportUrl: '',
        bio: maid.bio || '',
        bioAr: maid.bioAr || '',
        status: maid.status as MaidFormData['status'],
      };

      initializeForEdit(id!, formData);
    }
  }, [maidData, id, isEditing, initializeForEdit]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-0 items-center justify-center">
        <ActivityIndicator size="large" color="#FF385C" />
        <Text className="text-typography-500 mt-4">{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  if (error || !maidData?.data?.maid) {
    return (
      <SafeAreaView className="flex-1 bg-background-0 items-center justify-center px-6">
        <Text className="text-typography-900 text-xl font-semibold mb-2">
          {t('common.error')}
        </Text>
        <Text className="text-typography-500 text-center mb-6">
          {t('form.maidNotFound')}
        </Text>
        <View
          className="bg-primary-500 px-6 py-3 rounded-xl"
          onTouchEnd={() => router.back()}
        >
          <Text className="text-white font-semibold">{t('common.back')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Once data is loaded and form is initialized, render the create screen
  // which will now be in edit mode
  return <CreateMaidScreen />;
}
