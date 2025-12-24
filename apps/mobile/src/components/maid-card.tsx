import { View, Text, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { HeartIcon, UserIcon, DirhamIcon, StarIcon } from './icons';

interface MaidCardProps {
  maid: {
    id: string;
    name: string;
    nameAr: string | null;
    photoUrl: string | null;
    status: string;
    salary: string;
    experienceYears: number;
    nationality: { id: string; nameEn: string; nameAr: string } | null;
  };
  onPress?: () => void;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
}

export function MaidCard({
  maid,
  onPress,
  isFavorite = false,
  onFavoritePress,
}: MaidCardProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/maid/${maid.id}` as never);
    }
  };

  const handleFavoritePress = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onFavoritePress?.();
  };

  const displayName = isRTL && maid.nameAr ? maid.nameAr : maid.name;
  const nationalityName = maid.nationality
    ? (isRTL ? maid.nationality.nameAr : maid.nationality.nameEn)
    : null;

  // Generate a pseudo-rating from experience (4.0 - 5.0 range)
  const rating = Math.min(5, 4 + (maid.experienceYears * 0.1)).toFixed(1);

  return (
    <Pressable
      onPress={handlePress}
      className="w-full mb-6"
    >
      {/* Image Container */}
      <View className="relative mb-3">
        <View className="relative w-full h-52 bg-background-100 rounded-lg overflow-hidden">
          {maid.photoUrl ? (
            <Image
              source={{ uri: maid.photoUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <UserIcon size={48} color="#B0B0B0" />
            </View>
          )}

          {/* Favorite Button - Airbnb style with larger touch target */}
          <Pressable
            onPress={handleFavoritePress}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} w-9 h-9 rounded-full items-center justify-center`}
            style={{
              backgroundColor: isFavorite ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.3)',
            }}
          >
            <HeartIcon
              size={18}
              color={isFavorite ? '#FF385C' : '#FFFFFF'}
              filled={isFavorite}
            />
          </Pressable>

        </View>
      </View>

      {/* Content - Airbnb style */}
      <View className="space-y-1">
        {/* Name and Nationality Row */}
        <View className={`flex-row items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Text
            className="text-typography-900 font-normal text-sm"
            numberOfLines={1}
          >
            {displayName}
          </Text>
          {nationalityName && (
            <Text className="text-typography-900 font-normal text-sm" numberOfLines={1}>
              {isRTL ? `من ${nationalityName}` : `from ${nationalityName}`}
            </Text>
          )}
        </View>

        {/* Experience */}
        <Text className="text-typography-500 text-xs">
          {t('maid.yearsExperience', { years: maid.experienceYears })}
        </Text>

        {/* Price and Rating Row */}
        <View className={`flex-row items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <View className={`flex-row items-center gap-0.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className="text-typography-500 text-xs font-medium">
              {parseInt(maid.salary).toLocaleString()}
            </Text>
            <DirhamIcon size={12} color="#717171" />
            <Text className="text-typography-500 text-xs">
              {t('maid.perMonth')}
            </Text>
          </View>
          <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <StarIcon size={12} color="#717171" filled />
            <Text className="text-typography-500 text-xs font-medium ml-1">
              {rating}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
