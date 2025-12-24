import { View, Text, ScrollView, Image, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMaidForm, SKILL_OPTIONS, type MaidStatus } from '@/store/maid-form';
import { useNationalities, useLanguages } from '@/hooks';
import { DirhamIcon } from '@/components/icons';

export default function StepReview() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { formData, updateFormData } = useMaidForm();
  const { data: nationalitiesData } = useNationalities();
  const { data: languagesData } = useLanguages();

  const nationalities = nationalitiesData?.data || [];
  const languages = languagesData?.data || [];

  const nationality = nationalities.find((n) => n.id === formData.nationalityId);
  const selectedLanguages = languages.filter((l) => formData.languageIds?.includes(l.id));
  const selectedSkills = SKILL_OPTIONS.filter((s) => formData.skills?.includes(s.id));

  const isPublished = formData.status === 'available';

  const togglePublish = () => {
    const newStatus: MaidStatus = isPublished ? 'inactive' : 'available';
    updateFormData({ status: newStatus });
  };

  // Calculate age
  const birthDate = new Date(formData.dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();

  return (
    <View>
        {/* Profile Header */}
        <View className="items-center mb-6">
          {formData.photoUrl ? (
            <Image
              source={{ uri: formData.photoUrl }}
              className="w-32 h-40 rounded-2xl"
            />
          ) : (
            <View className="w-32 h-40 bg-background-200 rounded-2xl items-center justify-center">
              <Text className="text-4xl">👤</Text>
            </View>
          )}
          <Text className="text-typography-900 text-xl font-bold mt-3">
            {formData.name}
          </Text>
          {formData.nameAr && (
            <Text className="text-typography-500 text-base">{formData.nameAr}</Text>
          )}
        </View>

        {/* Summary Cards */}
        <View className="bg-background-50 rounded-2xl p-4 mb-4">
          <Text className="text-typography-700 font-semibold mb-3">{t('form.basicInfo')}</Text>
          <View className="space-y-2">
            <Row label={t('filters.nationality')} value={isRTL ? nationality?.nameAr : nationality?.nameEn} />
            <Row label={t('form.age')} value={`${age} ${t('form.years')}`} />
            <Row label={t('filters.maritalStatus')} value={t(`maritalStatus.${formData.maritalStatus}`)} />
            <Row label={t('filters.religion')} value={t(`religion.${formData.religion}`)} />
          </View>
        </View>

        <View className="bg-background-50 rounded-2xl p-4 mb-4">
          <Text className="text-typography-700 font-semibold mb-3">{t('form.experienceDetails')}</Text>
          <View className="space-y-2">
            <Row label={t('filters.experience')} value={`${formData.experienceYears} ${t('form.years')}`} />
            <View className="flex-row justify-between py-1">
              <Text className="text-typography-500">{t('filters.salary')}</Text>
              <View className="flex-row items-center gap-1">
                <Text className="text-typography-900 font-medium">{formData.salary}</Text>
                <DirhamIcon size={12} color="#222222" />
                <Text className="text-typography-900 font-medium">/{t('form.month')}</Text>
              </View>
            </View>
            {selectedSkills.length > 0 && (
              <Row
                label={t('form.skills')}
                value={selectedSkills.map((s) => isRTL ? s.labelAr : s.labelEn).join(', ')}
              />
            )}
          </View>
        </View>

        <View className="bg-background-50 rounded-2xl p-4 mb-4">
          <Text className="text-typography-700 font-semibold mb-3">{t('filters.languages')}</Text>
          <View className="flex-row flex-wrap gap-2">
            {selectedLanguages.map((lang) => (
              <View key={lang.id} className="bg-primary-100 px-3 py-1.5 rounded-full">
                <Text className="text-primary-700 text-sm">
                  {isRTL ? lang.nameAr : lang.nameEn}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Additional Photos */}
        {formData.additionalPhotos && formData.additionalPhotos.length > 0 && (
          <View className="bg-background-50 rounded-2xl p-4 mb-4">
            <Text className="text-typography-700 font-semibold mb-3">{t('form.additionalPhotos')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {formData.additionalPhotos.map((photo, index) => (
                  <Image
                    key={index}
                    source={{ uri: photo }}
                    className="w-20 h-20 rounded-lg"
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Bio */}
        <View className="mb-4">
          <Text className="text-typography-700 font-semibold mb-2">{t('form.bio')}</Text>
          <View className="bg-background-50 rounded-xl p-4">
            {formData.bio ? (
              <Text className="text-typography-700">{formData.bio}</Text>
            ) : (
              <Text className="text-typography-400 italic">{t('form.noBio')}</Text>
            )}
          </View>
        </View>

        {/* Publish Toggle */}
        <View className="bg-background-50 rounded-2xl p-4 mb-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-typography-900 font-semibold text-base">
                {isPublished ? t('form.published') : t('form.unpublished')}
              </Text>
              <Text className="text-typography-500 text-sm mt-1">
                {isPublished
                  ? t('form.publishedDescription')
                  : t('form.unpublishedDescription')
                }
              </Text>
            </View>
            <Switch
              value={isPublished}
              onValueChange={togglePublish}
              trackColor={{ false: '#E5E7EB', true: '#BBF7D0' }}
              thumbColor={isPublished ? '#22C55E' : '#9CA3AF'}
            />
          </View>
        </View>
    </View>
  );
}

// Helper component for rows
function Row({ label, value }: { label: string; value?: string }) {
  return (
    <View className="flex-row justify-between py-1">
      <Text className="text-typography-500">{label}</Text>
      <Text className="text-typography-900 font-medium">{value || '-'}</Text>
    </View>
  );
}
