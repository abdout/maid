import { View, Text, Pressable, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { HeartIcon, UserIcon, DirhamIcon, StarIcon, PhoneIcon, WhatsAppIcon } from './icons';
import { openWhatsApp, openPhoneDialer, generateCVInquiryMessage } from '@/lib/linking';

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
    cvReference?: string | null;
    office?: {
      phone: string;
      whatsAppNumber?: string | null;
    } | null;
  };
  onPress?: () => void;
  isFavorite?: boolean;
  onFavoritePress?: () => void;
  showContactButtons?: boolean;
}

export function MaidCard({
  maid,
  onPress,
  isFavorite = false,
  onFavoritePress,
  showContactButtons = true,
}: MaidCardProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const officePhone = maid.office?.whatsAppNumber || maid.office?.phone;
  const hasContactInfo = !!officePhone;

  const handleWhatsApp = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (!officePhone) return;
    const message = generateCVInquiryMessage(
      maid.cvReference || undefined,
      maid.name,
      isRTL
    );
    openWhatsApp(officePhone, message);
  };

  const handleCall = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (!officePhone) return;
    openPhoneDialer(officePhone);
  };

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
        <View className="w-full h-52 bg-background-100 rounded-lg overflow-hidden">
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
        </View>

        {/* Favorite Button - Outside overflow:hidden for proper touch handling */}
        <TouchableOpacity
          onPress={handleFavoritePress}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} w-8 h-8 rounded-full items-center justify-center`}
          style={{
            backgroundColor: isFavorite ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.4)',
            zIndex: 10,
          }}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? t('maid.removeFromFavorites') : t('maid.addToFavorites')}
          accessibilityState={{ selected: isFavorite }}
        >
          <HeartIcon
            size={16}
            color={isFavorite ? '#FF385C' : '#FFFFFF'}
            filled={isFavorite}
          />
        </TouchableOpacity>
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

        {/* Contact CTA Buttons - Free Mode */}
        {showContactButtons && hasContactInfo && (
          <View className={`flex-row gap-2 mt-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <TouchableOpacity
              onPress={handleWhatsApp}
              activeOpacity={0.7}
              className="flex-1 flex-row items-center justify-center gap-2 bg-[#25D366] py-2.5 rounded-lg"
              style={isRTL ? { flexDirection: 'row-reverse' } : undefined}
              accessibilityRole="button"
              accessibilityLabel={t('contact.whatsappAccessibility', 'Contact via WhatsApp')}
            >
              <WhatsAppIcon size={18} color="#FFFFFF" />
              <Text className="text-white font-medium text-sm">
                {t('contact.whatsapp', 'WhatsApp')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCall}
              activeOpacity={0.7}
              className="flex-1 flex-row items-center justify-center gap-2 bg-primary-500 py-2.5 rounded-lg"
              style={isRTL ? { flexDirection: 'row-reverse' } : undefined}
              accessibilityRole="button"
              accessibilityLabel={t('contact.callAccessibility', 'Make a phone call')}
            >
              <PhoneIcon size={18} color="#FFFFFF" />
              <Text className="text-white font-medium text-sm">
                {t('contact.call', 'Call')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Pressable>
  );
}
