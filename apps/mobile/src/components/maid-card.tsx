import { View, Text, Pressable, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { HeartIcon, UserIcon, DirhamIcon } from './icons';

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
  compact?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48; // 24px padding on each side
const IMAGE_HEIGHT = Math.round(CARD_WIDTH * (2 / 3)); // 3:2 aspect ratio

export function MaidCard({
  maid,
  onPress,
  isFavorite = false,
  onFavoritePress,
  compact = false
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

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    available: { bg: 'bg-success-500', text: 'text-white', label: t('maid.available') },
    busy: { bg: 'bg-warning-500', text: 'text-white', label: t('maid.busy') },
    reserved: { bg: 'bg-primary-500', text: 'text-white', label: t('maid.reserved') },
    inactive: { bg: 'bg-typography-400', text: 'text-white', label: t('maid.inactive') },
  };

  const status = statusConfig[maid.status] || statusConfig.inactive;

  // Compact card for grid layout
  if (compact) {
    const compactImageHeight = 140;
    return (
      <Pressable
        onPress={handlePress}
        className="bg-background-0 rounded-xl overflow-hidden mb-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {/* Image Container */}
        <View className="relative" style={{ height: compactImageHeight }}>
          {maid.photoUrl ? (
            <Image
              source={{ uri: maid.photoUrl }}
              className="w-full h-full"
              resizeMode="cover"
              style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
            />
          ) : (
            <View className="w-full h-full bg-background-100 items-center justify-center">
              <UserIcon size={48} color="#B0B0B0" />
            </View>
          )}

          {/* Status Badge - Top Left */}
          <View className={`absolute top-2 ${isRTL ? 'right-2' : 'left-2'}`}>
            <View className={`${status.bg} px-2 py-1 rounded-md`}>
              <Text className={`text-xs font-medium ${status.text}`}>
                {status.label}
              </Text>
            </View>
          </View>

          {/* Favorite Button - Top Right */}
          {onFavoritePress && (
            <Pressable
              onPress={handleFavoritePress}
              className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} w-8 h-8 rounded-full bg-white/90 items-center justify-center`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.15,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <HeartIcon
                size={18}
                color={isFavorite ? '#FF385C' : '#222222'}
                filled={isFavorite}
              />
            </Pressable>
          )}
        </View>

        {/* Content */}
        <View className={`p-3 ${isRTL ? 'items-end' : 'items-start'}`}>
          <Text
            className={`text-base font-semibold text-typography-900 ${isRTL ? 'text-right' : 'text-left'}`}
            numberOfLines={1}
          >
            {isRTL && maid.nameAr ? maid.nameAr : maid.name}
          </Text>

          {maid.nationality && (
            <Text className={`text-sm text-typography-400 mt-0.5 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? maid.nationality.nameAr : maid.nationality.nameEn}
            </Text>
          )}

          <View className={`flex-row items-center mt-2 gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className="text-base font-bold text-typography-900">
              {parseInt(maid.salary).toLocaleString()}
            </Text>
            <DirhamIcon size={14} color="#222222" />
          </View>
        </View>
      </Pressable>
    );
  }

  // Full-width card (default)
  return (
    <Pressable
      onPress={handlePress}
      className="bg-background-0 rounded-xl overflow-hidden mb-5"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Hero Image - 3:2 Aspect Ratio */}
      <View className="relative" style={{ height: IMAGE_HEIGHT }}>
        {maid.photoUrl ? (
          <Image
            source={{ uri: maid.photoUrl }}
            className="w-full h-full"
            resizeMode="cover"
            style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
          />
        ) : (
          <View className="w-full h-full bg-background-100 items-center justify-center">
            <UserIcon size={64} color="#B0B0B0" />
          </View>
        )}

        {/* Status Badge - Top Left */}
        <View className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'}`}>
          <View className={`${status.bg} px-3 py-1.5 rounded-lg`}>
            <Text className={`text-sm font-medium ${status.text}`}>
              {status.label}
            </Text>
          </View>
        </View>

        {/* Favorite Button - Top Right */}
        {onFavoritePress && (
          <Pressable
            onPress={handleFavoritePress}
            className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} w-10 h-10 rounded-full bg-white/90 items-center justify-center`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.15,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <HeartIcon
              size={22}
              color={isFavorite ? '#FF385C' : '#222222'}
              filled={isFavorite}
            />
          </Pressable>
        )}
      </View>

      {/* Content Section */}
      <View className={`p-4 ${isRTL ? 'items-end' : 'items-start'}`}>
        {/* Name */}
        <Text
          className={`text-xl font-semibold text-typography-900 ${isRTL ? 'text-right' : 'text-left'}`}
          numberOfLines={1}
        >
          {isRTL && maid.nameAr ? maid.nameAr : maid.name}
        </Text>

        {/* Nationality & Experience */}
        <View className={`flex-row items-center mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {maid.nationality && (
            <>
              <Text className="text-base text-typography-400">
                {isRTL ? maid.nationality.nameAr : maid.nationality.nameEn}
              </Text>
              <Text className="text-typography-300 mx-2">•</Text>
            </>
          )}
          <Text className="text-base text-typography-400">
            {t('maid.yearsExperience', { years: maid.experienceYears })}
          </Text>
        </View>

        {/* Price */}
        <View className={`flex-row items-center mt-3 gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Text className="text-xl font-bold text-typography-900">
            {parseInt(maid.salary).toLocaleString()}
          </Text>
          <DirhamIcon size={18} color="#222222" />
        </View>
      </View>
    </Pressable>
  );
}
