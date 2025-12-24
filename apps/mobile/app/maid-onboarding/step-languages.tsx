import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMaidForm } from '@/store/maid-form';
import { useLanguages } from '@/hooks';

export default function StepLanguages() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { formData, updateFormData, errors } = useMaidForm();
  const { data: languagesData } = useLanguages();
  const languages = languagesData?.data || [];

  const toggleLanguage = (langId: string) => {
    const currentLanguages = formData.languageIds || [];
    const updatedLanguages = currentLanguages.includes(langId)
      ? currentLanguages.filter((id) => id !== langId)
      : [...currentLanguages, langId];
    updateFormData({ languageIds: updatedLanguages });
  };

  // Common languages to highlight
  const commonLanguageIds = languages
    .filter((l) => ['ar', 'en'].includes(l.code))
    .map((l) => l.id);

  const commonLanguages = languages.filter((l) => commonLanguageIds.includes(l.id));
  const otherLanguages = languages.filter((l) => !commonLanguageIds.includes(l.id));

  return (
    <View>
      {/* Description */}
      <Text className={`text-typography-500 mb-4 ${isRTL ? 'text-right' : ''}`}>
        {t('form.languagesDescription')}
      </Text>

      {/* Common Languages */}
      <View className="mb-4">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {t('form.commonLanguages')}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {commonLanguages.map((lang) => {
            const isSelected = formData.languageIds?.includes(lang.id);
            return (
              <Pressable
                key={lang.id}
                onPress={() => toggleLanguage(lang.id)}
                className={`px-5 py-3 rounded-xl border ${
                  isSelected
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-background-0 border-background-200'
                }`}
              >
                <Text
                  className={`text-base ${
                    isSelected ? 'text-white font-medium' : 'text-typography-700'
                  }`}
                >
                  {isRTL ? lang.nameAr : lang.nameEn}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* All Languages */}
      <View className="mb-5">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {t('form.otherLanguages')}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {otherLanguages.map((lang) => {
            const isSelected = formData.languageIds?.includes(lang.id);
            return (
              <Pressable
                key={lang.id}
                onPress={() => toggleLanguage(lang.id)}
                className={`px-4 py-2.5 rounded-full border ${
                  isSelected
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-background-0 border-background-200'
                }`}
              >
                <Text
                  className={isSelected ? 'text-white font-medium' : 'text-typography-700'}
                >
                  {isRTL ? lang.nameAr : lang.nameEn}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Selected Count */}
      <View className="bg-background-50 rounded-xl p-4 mb-5">
        <Text className={`text-typography-700 ${isRTL ? 'text-right' : ''}`}>
          {t('form.selectedLanguages')}: {formData.languageIds?.length || 0}
        </Text>
      </View>

      {errors.languageIds && (
        <Text className="text-error-500 text-sm mb-4">{errors.languageIds}</Text>
      )}
    </View>
  );
}
