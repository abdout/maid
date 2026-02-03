import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMaidForm } from '@/store/maid-form';

// Skill levels for each service type
const SKILL_LEVELS = [
  { id: 'no', labelEn: 'No', labelAr: 'لا' },
  { id: 'good', labelEn: 'Good', labelAr: 'جيد' },
  { id: 'expert', labelEn: 'Expert', labelAr: 'خبير' },
  { id: 'willing', labelEn: 'Willing', labelAr: 'مستعد' },
] as const;

// Service types with their skill field names
const SERVICE_SKILLS = [
  { id: 'cleaning', labelEn: 'Cleaning', labelAr: 'تنظيف', field: 'cleaningSkill' },
  { id: 'cooking', labelEn: 'Cooking', labelAr: 'طبخ', field: 'cookingSkills' },
  { id: 'babysitter', labelEn: 'Babysitter', labelAr: 'رعاية أطفال', field: 'babysitterSkill' },
  { id: 'elderly', labelEn: 'Elderly Care', labelAr: 'رعاية مسنين', field: 'elderlySkill' },
] as const;

type SkillLevel = 'no' | 'good' | 'expert' | 'willing';

export default function StepSkillsSalary() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { formData, updateFormData } = useMaidForm();

  // Get skill value for a service type
  const getSkillValue = (field: string): SkillLevel => {
    if (field === 'cookingSkills') {
      // Map existing cookingSkills values to new format
      const val = formData.cookingSkills;
      if (val === 'none') return 'no';
      if (val === 'good') return 'good';
      if (val === 'average') return 'good';
      if (val === 'willing_to_learn') return 'willing';
      return 'no';
    }
    // For new fields, check custom storage
    const customSkills = (formData as any).serviceSkills || {};
    return customSkills[field] || 'no';
  };

  // Set skill value for a service type
  const setSkillValue = (field: string, level: SkillLevel) => {
    if (field === 'cookingSkills') {
      // Map to existing cookingSkills format
      let mappedValue: 'none' | 'good' | 'average' | 'willing_to_learn' = 'none';
      if (level === 'good') mappedValue = 'good';
      if (level === 'expert') mappedValue = 'good';
      if (level === 'willing') mappedValue = 'willing_to_learn';
      updateFormData({ cookingSkills: mappedValue });
    } else {
      // Store in custom field
      const customSkills = (formData as any).serviceSkills || {};
      updateFormData({
        serviceSkills: { ...customSkills, [field]: level },
      } as any);
    }
  };

  return (
    <View>
      <Text className={`text-typography-500 mb-4 ${isRTL ? 'text-right' : ''}`}>
        {isRTL ? 'حدد مستوى المهارة لكل نوع خدمة' : 'Select skill level for each service type'}
      </Text>

      {/* Skill Matrix - Each service type with levels */}
      {SERVICE_SKILLS.map((service) => {
        const currentLevel = getSkillValue(service.field);

        return (
          <View key={service.id} className="mb-5">
            {/* Service Type Label */}
            <Text className={`text-typography-900 font-semibold mb-3 ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? service.labelAr : service.labelEn}
            </Text>

            {/* Skill Level Pills */}
            <View className={`flex-row gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {SKILL_LEVELS.map((level) => {
                const isSelected = currentLevel === level.id;
                return (
                  <Pressable
                    key={level.id}
                    onPress={() => setSkillValue(service.field, level.id as SkillLevel)}
                    className={`flex-1 py-3 rounded-xl border ${
                      isSelected
                        ? 'bg-primary-500 border-primary-500'
                        : 'bg-background-0 border-background-200'
                    }`}
                  >
                    <Text
                      className={`text-center text-sm ${
                        isSelected ? 'text-white font-medium' : 'text-typography-700'
                      }`}
                    >
                      {isRTL ? level.labelAr : level.labelEn}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}
