import { View, Text, Image, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  useMaidForm,
  type MaidStatus,
  JOB_TYPE_OPTIONS,
  PACKAGE_TYPE_OPTIONS,
  COOKING_SKILL_OPTIONS,
  EDUCATION_OPTIONS,
  AVAILABILITY_OPTIONS,
  SEX_OPTIONS,
  RELIGION_OPTIONS,
} from '@/store/maid-form';
import { NATIONALITIES } from '@/constants';
import { useLanguages } from '@/hooks';
import { DirhamIcon } from '@/components/icons';

export default function StepReview() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { formData, updateFormData } = useMaidForm();
  const { data: languagesData } = useLanguages();

  const languages = languagesData?.data || [];

  const nationality = NATIONALITIES.find((n) => n.id === formData.nationalityId);
  const selectedLanguages = languages.filter((l) => formData.languageIds?.includes(l.id));

  const jobType = JOB_TYPE_OPTIONS.find((j) => j.id === formData.jobType);
  const packageType = PACKAGE_TYPE_OPTIONS.find((p) => p.id === formData.packageType);
  const cookingSkill = COOKING_SKILL_OPTIONS.find((c) => c.id === formData.cookingSkills);
  const education = EDUCATION_OPTIONS.find((e) => e.id === formData.education);
  const availability = AVAILABILITY_OPTIONS.find((a) => a.id === formData.availability);
  const sex = SEX_OPTIONS.find((s) => s.id === formData.sex);
  const religion = RELIGION_OPTIONS.find((r) => r.id === formData.religion);

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
        {formData.cvReference && (
          <Text className="text-primary-500 text-sm mt-1">
            {isRTL ? `المرجع: ${formData.cvReference}` : `Ref: ${formData.cvReference}`}
          </Text>
        )}
      </View>

      {/* Basic Info */}
      <View className="bg-background-50 rounded-2xl p-4 mb-4">
        <Text className="text-typography-700 font-semibold mb-3">{t('form.basicInfo')}</Text>
        <View className="space-y-2">
          <Row label={t('filters.nationality')} value={`${nationality?.flag || ''} ${isRTL ? nationality?.nameAr : nationality?.nameEn}`} />
          <Row label={isRTL ? 'الجنس' : 'Sex'} value={isRTL ? sex?.labelAr : sex?.labelEn} />
          <Row label={t('form.age')} value={`${age} ${t('form.years')}`} />
          <Row label={isRTL ? 'التعليم' : 'Education'} value={isRTL ? education?.labelAr : education?.labelEn} />
          <Row label={t('filters.maritalStatus')} value={t(`maritalStatus.${formData.maritalStatus}`)} />
          <Row label={isRTL ? 'لديها أطفال' : 'Has Children'} value={formData.hasChildren ? t('common.yes') : t('common.no')} />
          <Row label={t('filters.religion')} value={isRTL ? religion?.labelAr : religion?.labelEn} />
        </View>
      </View>

      {/* Job & Package */}
      <View className="bg-background-50 rounded-2xl p-4 mb-4">
        <Text className="text-typography-700 font-semibold mb-3">{isRTL ? 'الوظيفة والباقة' : 'Job & Package'}</Text>
        <View className="space-y-2">
          <Row label={isRTL ? 'نوع الوظيفة' : 'Job Type'} value={isRTL ? jobType?.labelAr : jobType?.labelEn} />
          <Row label={isRTL ? 'نوع الباقة' : 'Package Type'} value={isRTL ? packageType?.labelAr : packageType?.labelEn} />
        </View>
      </View>

      {/* Experience & Skills */}
      <View className="bg-background-50 rounded-2xl p-4 mb-4">
        <Text className="text-typography-700 font-semibold mb-3">{t('form.experienceDetails')}</Text>
        <View className="space-y-2">
          <Row label={isRTL ? 'لديها خبرة' : 'Has Experience'} value={formData.hasExperience ? t('common.yes') : t('common.no')} />
          {formData.hasExperience && (
            <Row label={t('filters.experience')} value={`${formData.experienceYears} ${t('form.years')}`} />
          )}
          {formData.experienceDetails && (
            <Row label={isRTL ? 'تفاصيل الخبرة' : 'Experience Details'} value={formData.experienceDetails} />
          )}
          {formData.skillsDetails && (
            <Row label={isRTL ? 'المهارات' : 'Skills'} value={formData.skillsDetails} />
          )}
          <Row label={isRTL ? 'مهارات الطبخ' : 'Cooking Skills'} value={isRTL ? cookingSkill?.labelAr : cookingSkill?.labelEn} />
          <Row label={isRTL ? 'رعاية الأطفال' : 'Baby Sitter'} value={formData.babySitter ? t('common.yes') : t('common.no')} />
          <Row label={isRTL ? 'التواجد' : 'Availability'} value={isRTL ? availability?.labelAr : availability?.labelEn} />
        </View>
      </View>

      {/* Salary & Fees */}
      <View className="bg-background-50 rounded-2xl p-4 mb-4">
        <Text className="text-typography-700 font-semibold mb-3">{isRTL ? 'الراتب والرسوم' : 'Salary & Fees'}</Text>
        <View className="space-y-2">
          <View className="flex-row justify-between py-1">
            <Text className="text-typography-500">{t('filters.salary')}</Text>
            <View className="flex-row items-center gap-1">
              <Text className="text-typography-900 font-medium">{formData.salary}</Text>
              <DirhamIcon size={12} color="#222222" />
              <Text className="text-typography-900 font-medium">/{t('form.month')}</Text>
            </View>
          </View>
          {formData.officeFees && (
            <View className="flex-row justify-between py-1">
              <Text className="text-typography-500">{isRTL ? 'رسوم المكتب' : 'Office Fees'}</Text>
              <View className="flex-row items-center gap-1">
                <Text className="text-typography-900 font-medium">{formData.officeFees}</Text>
                <DirhamIcon size={12} color="#222222" />
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Languages */}
      {selectedLanguages.length > 0 && (
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
      )}

      {/* Contact Info */}
      <View className="bg-background-50 rounded-2xl p-4 mb-4">
        <Text className="text-typography-700 font-semibold mb-3">{isRTL ? 'معلومات الاتصال' : 'Contact Info'}</Text>
        <View className="space-y-2">
          <Row label={isRTL ? 'رقم الواتساب' : 'WhatsApp'} value={formData.whatsappNumber} />
          <Row label={isRTL ? 'رقم الاتصال' : 'Contact'} value={formData.contactNumber} />
        </View>
      </View>

      {/* Bio */}
      {(formData.bio || formData.bioAr) && (
        <View className="mb-4">
          <Text className="text-typography-700 font-semibold mb-2">{t('form.bio')}</Text>
          <View className="bg-background-50 rounded-xl p-4">
            {formData.bio && <Text className="text-typography-700">{formData.bio}</Text>}
            {formData.bioAr && <Text className="text-typography-700 text-right mt-2">{formData.bioAr}</Text>}
          </View>
        </View>
      )}

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
      <Text className="text-typography-500 flex-shrink-0">{label}</Text>
      <Text className="text-typography-900 font-medium flex-1 text-right ml-2" numberOfLines={2}>{value || '-'}</Text>
    </View>
  );
}
