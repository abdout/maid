import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  GridIcon,
  UserIcon,
  BriefcaseIcon,
  SparklesIcon,
  ChefHatIcon,
  BabyIcon,
  HeartIcon,
  CarIcon,
} from '@/components/icons';

// Icon component map for direct rendering
const iconComponents = {
  grid: GridIcon,
  user: UserIcon,
  briefcase: BriefcaseIcon,
  sparkles: SparklesIcon,
  'chef-hat': ChefHatIcon,
  baby: BabyIcon,
  heart: HeartIcon,
  car: CarIcon,
} as const;

type CategoryIconName = keyof typeof iconComponents;

// Service type categories
const SERVICE_TYPES: ReadonlyArray<{
  id: string;
  icon: CategoryIconName;
  labelEn: string;
  labelAr: string;
}> = [
  { id: 'all', icon: 'grid', labelEn: 'All', labelAr: 'الكل' },
  { id: 'individual', icon: 'user', labelEn: 'Individual', labelAr: 'فردي' },
  { id: 'business', icon: 'briefcase', labelEn: 'Business', labelAr: 'تجاري' },
  { id: 'cleaning', icon: 'sparkles', labelEn: 'Cleaning', labelAr: 'تنظيف' },
  { id: 'cooking', icon: 'chef-hat', labelEn: 'Cooking', labelAr: 'طبخ' },
  { id: 'babysitter', icon: 'baby', labelEn: 'Babysitter', labelAr: 'مربية' },
  { id: 'elderly', icon: 'heart', labelEn: 'Elderly', labelAr: 'مسنين' },
  { id: 'driver', icon: 'car', labelEn: 'Driver', labelAr: 'سائق' },
];

interface CategoryFilterProps {
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const handlePress = (id: string) => {
    if (id === 'all') {
      onSelect(null);
    } else if (selected === id) {
      onSelect(null); // Deselect
    } else {
      onSelect(id);
    }
  };

  const isSelected = (id: string) => {
    if (id === 'all') return selected === null;
    return selected === id;
  };

  return (
    <View className="border-b border-background-100">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 0,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        }}
      >
        {SERVICE_TYPES.map((category) => {
          const IconComponent = iconComponents[category.icon];
          const isActive = isSelected(category.id);

          return (
            <Pressable
              key={category.id}
              onPress={() => handlePress(category.id)}
              className={`flex-col items-center justify-center px-4 py-3 min-w-[72px] border-b-2 ${
                isActive
                  ? 'border-primary-500'
                  : 'border-transparent'
              }`}
            >
              <IconComponent
                size={24}
                color={isActive ? '#222222' : '#717171'}
              />
              <Text
                className={`text-xs font-medium mt-1 ${
                  isActive
                    ? 'text-typography-900'
                    : 'text-typography-400'
                }`}
              >
                {isRTL ? category.labelAr : category.labelEn}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default CategoryFilter;
