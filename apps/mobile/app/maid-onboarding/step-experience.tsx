import { View, Text, TextInput, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMaidForm, SKILL_OPTIONS } from '@/store/maid-form';
import { DirhamIcon } from '@/components/icons';

export default function StepExperience() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { formData, updateFormData, errors } = useMaidForm();

  const toggleSkill = (skillId: string) => {
    const currentSkills = formData.skills || [];
    const updatedSkills = currentSkills.includes(skillId)
      ? currentSkills.filter((id) => id !== skillId)
      : [...currentSkills, skillId];
    updateFormData({ skills: updatedSkills });
  };

  return (
    <View>
      {/* Experience Years */}
      <View className="mb-5">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {t('filters.experience')} ({t('form.years')}) *
        </Text>
        <View className="flex-row items-center gap-4">
          <Pressable
            onPress={() =>
              updateFormData({
                experienceYears: Math.max(0, formData.experienceYears - 1),
              })
            }
            className="w-12 h-12 bg-background-100 rounded-full items-center justify-center"
          >
            <Text className="text-2xl text-typography-700">−</Text>
          </Pressable>
          <View className="flex-1 bg-background-50 rounded-xl px-4 py-3.5 items-center">
            <Text className="text-typography-900 text-xl font-semibold">
              {formData.experienceYears}
            </Text>
          </View>
          <Pressable
            onPress={() =>
              updateFormData({
                experienceYears: Math.min(30, formData.experienceYears + 1),
              })
            }
            className="w-12 h-12 bg-background-100 rounded-full items-center justify-center"
          >
            <Text className="text-2xl text-typography-700">+</Text>
          </Pressable>
        </View>
        {errors.experienceYears && (
          <Text className="text-error-500 text-sm mt-1">{errors.experienceYears}</Text>
        )}
      </View>

      {/* Salary */}
      <View className="mb-5">
        <View className={`flex-row items-center mb-2 gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Text className={`text-typography-700 font-medium`}>
            {t('filters.salary')}
          </Text>
          <Text className="text-typography-700">(</Text>
          <DirhamIcon size={14} color="#374151" />
          <Text className="text-typography-700">/{t('form.month')}) *</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <DirhamIcon size={16} color="#6B7280" />
          <TextInput
            value={formData.salary}
            onChangeText={(v) => updateFormData({ salary: v })}
            keyboardType="decimal-pad"
            placeholder="2000"
            className={`flex-1 bg-background-50 rounded-xl px-4 py-3.5 text-typography-900 ${
              errors.salary ? 'border border-error-500' : ''
            }`}
          />
        </View>
        {errors.salary && (
          <Text className="text-error-500 text-sm mt-1">{errors.salary}</Text>
        )}
        <Text className="text-typography-400 text-sm mt-1">
          {t('form.salaryRange')}
        </Text>
      </View>

      {/* Skills */}
      <View className="mb-6">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {t('form.skills')}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {SKILL_OPTIONS.map((skill) => {
            const isSelected = formData.skills?.includes(skill.id);
            return (
              <Pressable
                key={skill.id}
                onPress={() => toggleSkill(skill.id)}
                className={`px-4 py-2.5 rounded-full border ${
                  isSelected
                    ? 'bg-primary-500 border-primary-500'
                    : 'bg-background-0 border-background-200'
                }`}
              >
                <Text
                  className={isSelected ? 'text-white font-medium' : 'text-typography-700'}
                >
                  {isRTL ? skill.labelAr : skill.labelEn}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
