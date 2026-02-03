import { View, Text, Pressable, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { PhoneIcon, WhatsAppIcon, MapPinIcon, CheckBadgeIcon, BuildingIcon } from './icons';
import { openWhatsApp, openPhoneDialer, openMaps } from '@/lib/linking';

interface BusinessCardProps {
  business: {
    id: string;
    type: 'typing_office' | 'visa_transfer';
    name: string;
    nameAr: string | null;
    phone: string;
    whatsapp: string | null;
    logoUrl: string | null;
    address: string | null;
    addressAr: string | null;
    emirate: string | null;
    priceRange: string | null;
    workingHours: string | null;
    isVerified: boolean;
    googleMapsUrl: string | null;
  };
  onPress?: () => void;
}

export function BusinessCard({ business, onPress }: BusinessCardProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const whatsappNumber = business.whatsapp || business.phone;

  const handleWhatsApp = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    const message = isRTL
      ? `مرحباً، أريد الاستفسار عن خدماتكم`
      : `Hello, I want to inquire about your services`;
    openWhatsApp(whatsappNumber, message);
  };

  const handleCall = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    openPhoneDialer(business.phone);
  };

  const handleMaps = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (business.googleMapsUrl) {
      openMaps(business.googleMapsUrl);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/business/${business.id}` as never);
    }
  };

  const displayName = isRTL && business.nameAr ? business.nameAr : business.name;
  const displayAddress = isRTL && business.addressAr ? business.addressAr : business.address;

  return (
    <Pressable onPress={handlePress} className="w-full mb-6">
      {/* Image Container */}
      <View className="relative mb-3">
        <View className="w-full h-40 bg-background-100 rounded-lg overflow-hidden">
          {business.logoUrl ? (
            <Image
              source={{ uri: business.logoUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-background-100">
              <BuildingIcon size={48} color="#B0B0B0" />
            </View>
          )}
        </View>

        {/* Verified Badge */}
        {business.isVerified && (
          <View
            className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} flex-row items-center bg-white px-2 py-1 rounded-full`}
            style={isRTL ? { flexDirection: 'row-reverse' } : undefined}
          >
            <CheckBadgeIcon size={14} color="#22C55E" />
            <Text className="text-xs text-green-600 font-medium ml-1">
              {t('business.verified', 'Verified')}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View className="space-y-1">
        {/* Name */}
        <Text
          className="text-typography-900 font-semibold text-base"
          numberOfLines={1}
        >
          {displayName}
        </Text>

        {/* Location */}
        {(displayAddress || business.emirate) && (
          <View className={`flex-row items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <MapPinIcon size={12} color="#717171" />
            <Text className="text-typography-500 text-xs" numberOfLines={1}>
              {displayAddress || business.emirate}
            </Text>
          </View>
        )}

        {/* Price Range & Working Hours */}
        <View className={`flex-row items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {business.priceRange && (
            <Text className="text-typography-500 text-xs">
              {business.priceRange}
            </Text>
          )}
          {business.workingHours && (
            <Text className="text-typography-500 text-xs">
              {business.workingHours}
            </Text>
          )}
        </View>

        {/* Contact CTA Buttons */}
        <View className={`flex-row gap-2 mt-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <TouchableOpacity
            onPress={handleWhatsApp}
            activeOpacity={0.7}
            className="flex-1 flex-row items-center justify-center gap-2 bg-[#25D366] py-2.5 rounded-lg"
            style={isRTL ? { flexDirection: 'row-reverse' } : undefined}
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
          >
            <PhoneIcon size={18} color="#FFFFFF" />
            <Text className="text-white font-medium text-sm">
              {t('contact.call', 'Call')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Maps Button (if available) */}
        {business.googleMapsUrl && (
          <TouchableOpacity
            onPress={handleMaps}
            activeOpacity={0.7}
            className="flex-row items-center justify-center gap-2 bg-background-100 py-2.5 rounded-lg mt-2"
            style={isRTL ? { flexDirection: 'row-reverse' } : undefined}
          >
            <MapPinIcon size={18} color="#666666" />
            <Text className="text-typography-700 font-medium text-sm">
              {t('business.viewOnMap', 'View on Map')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Pressable>
  );
}
