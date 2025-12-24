import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
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
    <View className="px-6">
      <View
        className="flex-row justify-between"
        style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
      >
        {SERVICE_TYPES.map((category) => {
          const isActive = isSelected(category.id);

          return (
            <Pressable
              key={category.id}
              onPress={() => handlePress(category.id)}
              className="flex-col items-center justify-center py-3"
              style={{ opacity: isActive ? 1 : 0.35 }}
            >
              <View className="relative">
                <Image
                  source={categoryImages[category.image]}
                  style={{ width: 32, height: 32 }}
                  resizeMode="contain"
                />
                {/* Selection indicator dot */}
                {isActive && (
                  <View
                    className="absolute w-2 h-2 rounded-full bg-typography-900"
                    style={{ top: -2, [isRTL ? 'right' : 'left']: -2 }}
                  />
                )}
              </View>
              <Text className="text-xs font-medium mt-1 text-typography-900">
                {isRTL ? category.labelAr : category.labelEn}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default CategoryFilter;
