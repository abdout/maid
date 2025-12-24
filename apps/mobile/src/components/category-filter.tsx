import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { useTranslation } from 'react-i18next';

// PNG image assets for categories
const categoryImages = {
  cleaning: require('../../assets/wipe.png'),
  cooking: require('../../assets/chef-hat.png'),
  babysitter: require('../../assets/baby-stroller.png'),
  elderly: require('../../assets/old-people.png'),
} as const;

type CategoryImageName = keyof typeof categoryImages;

// Service type categories
const SERVICE_TYPES: ReadonlyArray<{
  id: string;
  image: CategoryImageName;
  labelEn: string;
  labelAr: string;
}> = [
  { id: 'cleaning', image: 'cleaning', labelEn: 'Cleaning', labelAr: 'تنظيف' },
  { id: 'cooking', image: 'cooking', labelEn: 'Cooking', labelAr: 'طبخ' },
  { id: 'babysitter', image: 'babysitter', labelEn: 'Babysitter', labelAr: 'مربية' },
  { id: 'elderly', image: 'elderly', labelEn: 'Elderly', labelAr: 'مسنين' },
];

interface CategoryFilterProps {
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const handlePress = (id: string) => {
    if (selected === id) {
      onSelect(null); // Deselect to show all
    } else {
      onSelect(id);
    }
  };

  const isSelected = (id: string) => selected === id;

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
              <Image
                source={categoryImages[category.image]}
                style={{ width: 32, height: 32, opacity: isActive ? 1 : 0.5 }}
                resizeMode="contain"
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
