import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Share,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useBusiness } from '@/hooks';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
  ShareIcon,
  BuildingIcon,
  PhoneIcon,
  MapPinIcon,
  CheckBadgeIcon,
  WhatsAppIcon,
  EmailIcon,
} from '@/components/icons';
import { openWhatsApp, openPhoneDialer, openMaps } from '@/lib/linking';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.35;

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';
  const insets = useSafeAreaInsets();

  const { data, isLoading, error } = useBusiness(id);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this business: https://maid-xi.vercel.app/business/${id}`,
        url: `https://maid-xi.vercel.app/business/${id}`,
      });
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-0 items-center justify-center">
        <ActivityIndicator size="large" color="#FF385C" />
      </SafeAreaView>
    );
  }

  if (error || !data?.data) {
    return (
      <SafeAreaView className="flex-1 bg-background-0 items-center justify-center px-6">
        <View className="w-20 h-20 rounded-full bg-background-100 items-center justify-center mb-4">
          <XIcon size={40} color="#B0B0B0" />
        </View>
        <Text className="text-typography-400 text-center">{t('common.error')}</Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 px-6 py-3 bg-primary-500 rounded-xl"
        >
          <Text className="text-white font-medium">{t('common.retry')}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const business = data.data;
  const displayName = isRTL && business.nameAr ? business.nameAr : business.name;
  const displayAddress = isRTL && business.addressAr ? business.addressAr : business.address;
  const displayDescription = isRTL && business.descriptionAr ? business.descriptionAr : business.description;
  const displayServices = isRTL && business.servicesAr ? business.servicesAr : business.services;

  const whatsappNumber = business.whatsapp || business.phone;

  const handleWhatsApp = () => {
    const message = isRTL
      ? `مرحباً، أريد الاستفسار عن خدماتكم`
      : `Hello, I want to inquire about your services`;
    openWhatsApp(whatsappNumber, message);
  };

  const handleCall = () => {
    openPhoneDialer(business.phone);
  };

  const handleMaps = () => {
    if (business.googleMapsUrl) {
      openMaps(business.googleMapsUrl);
    } else if (displayAddress) {
      openMaps(displayAddress);
    }
  };

  // Parse services JSON if available
  let servicesList: string[] = [];
  if (displayServices) {
    try {
      servicesList = JSON.parse(displayServices);
    } catch {
      servicesList = [displayServices];
    }
  }

  const typeLabel = business.type === 'typing_office'
    ? t('business.typingOffice', 'Typing Office')
    : t('business.visaTransferService', 'Visa Transfer Service');

  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={{ height: HEADER_HEIGHT }} className="bg-background-100">
          {business.coverPhotoUrl || business.logoUrl ? (
            <Image
              source={{ uri: business.coverPhotoUrl || business.logoUrl || '' }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-background-100">
              <BuildingIcon size={80} color="#B0B0B0" />
            </View>
          )}

          {/* Navigation Buttons */}
          <View
            className={`absolute ${isRTL ? 'right-4' : 'left-4'}`}
            style={{ top: insets.top + 8 }}
          >
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 bg-white/90 rounded-full items-center justify-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.15,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              {isRTL ? (
                <ChevronRightIcon size={24} color="#222222" />
              ) : (
                <ChevronLeftIcon size={24} color="#222222" />
              )}
            </Pressable>
          </View>

          <View
            className={`absolute ${isRTL ? 'left-4' : 'right-4'}`}
            style={{ top: insets.top + 8 }}
          >
            <Pressable
              onPress={handleShare}
              className="w-10 h-10 bg-white/90 rounded-full items-center justify-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.15,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <ShareIcon size={20} color="#222222" />
            </Pressable>
          </View>
        </View>

        {/* Content */}
        <View className="px-6 py-6">
          {/* Title & Verified Badge */}
          <View className={`flex-row items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className="text-2xl font-bold text-typography-900 flex-1" numberOfLines={2}>
              {displayName}
            </Text>
            {business.isVerified && (
              <View className="flex-row items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                <CheckBadgeIcon size={16} color="#22C55E" />
                <Text className="text-green-600 text-sm font-medium">
                  {t('business.verified', 'Verified')}
                </Text>
              </View>
            )}
          </View>

          {/* Type Label */}
          <Text className={`text-typography-500 mt-1 ${isRTL ? 'text-right' : ''}`}>
            {typeLabel}
          </Text>

          {/* Section Divider */}
          <View className="border-b border-background-200 my-6" />

          {/* Location */}
          {(displayAddress || business.emirate) && (
            <View className="pb-6">
              <Text className={`text-lg font-semibold text-typography-900 mb-3 ${isRTL ? 'text-right' : ''}`}>
                {t('business.location', 'Location')}
              </Text>
              <View className={`flex-row items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <View className="w-10 h-10 bg-background-100 rounded-full items-center justify-center">
                  <MapPinIcon size={20} color="#717171" />
                </View>
                <View className="flex-1">
                  {displayAddress && (
                    <Text className={`text-typography-700 ${isRTL ? 'text-right' : ''}`}>
                      {displayAddress}
                    </Text>
                  )}
                  {business.emirate && (
                    <Text className={`text-typography-500 ${isRTL ? 'text-right' : ''}`}>
                      {business.emirate}
                    </Text>
                  )}
                </View>
              </View>
              {(business.googleMapsUrl || displayAddress) && (
                <TouchableOpacity
                  onPress={handleMaps}
                  className="mt-3 flex-row items-center justify-center gap-2 bg-background-100 py-3 rounded-lg"
                  style={isRTL ? { flexDirection: 'row-reverse' } : undefined}
                >
                  <MapPinIcon size={18} color="#666666" />
                  <Text className="text-typography-700 font-medium">
                    {t('business.viewOnMap', 'View on Map')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Working Hours */}
          {business.workingHours && (
            <>
              <View className="border-b border-background-200 mb-6" />
              <View className="pb-6">
                <Text className={`text-lg font-semibold text-typography-900 mb-3 ${isRTL ? 'text-right' : ''}`}>
                  {t('business.workingHours', 'Working Hours')}
                </Text>
                <Text className={`text-typography-700 ${isRTL ? 'text-right' : ''}`}>
                  {business.workingHours}
                </Text>
              </View>
            </>
          )}

          {/* Price Range */}
          {business.priceRange && (
            <>
              <View className="border-b border-background-200 mb-6" />
              <View className="pb-6">
                <Text className={`text-lg font-semibold text-typography-900 mb-3 ${isRTL ? 'text-right' : ''}`}>
                  {t('business.priceRange', 'Price Range')}
                </Text>
                <Text className={`text-typography-700 ${isRTL ? 'text-right' : ''}`}>
                  {business.priceRange}
                </Text>
              </View>
            </>
          )}

          {/* Services */}
          {servicesList.length > 0 && (
            <>
              <View className="border-b border-background-200 mb-6" />
              <View className="pb-6">
                <Text className={`text-lg font-semibold text-typography-900 mb-3 ${isRTL ? 'text-right' : ''}`}>
                  {t('business.services', 'Services')}
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {servicesList.map((service, index) => (
                    <View key={index} className="bg-background-100 px-3 py-2 rounded-lg">
                      <Text className="text-typography-700">{service}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Description */}
          {displayDescription && (
            <>
              <View className="border-b border-background-200 mb-6" />
              <View className="pb-6">
                <Text className={`text-lg font-semibold text-typography-900 mb-3 ${isRTL ? 'text-right' : ''}`}>
                  {t('business.about', 'About')}
                </Text>
                <Text className={`text-typography-600 leading-6 ${isRTL ? 'text-right' : ''}`}>
                  {displayDescription}
                </Text>
              </View>
            </>
          )}

          {/* Contact Section */}
          <View className="border-b border-background-200 mb-6" />
          <View className="pb-6">
            <Text className={`text-lg font-semibold text-typography-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
              {t('business.contactInfo', 'Contact Information')}
            </Text>

            {/* Phone */}
            <View className={`flex-row items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <View className="w-10 h-10 bg-background-100 rounded-full items-center justify-center">
                <PhoneIcon size={20} color="#717171" />
              </View>
              <Text className="text-typography-700 flex-1">{business.phone}</Text>
            </View>

            {/* Email */}
            {business.email && (
              <View className={`flex-row items-center gap-3 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <View className="w-10 h-10 bg-background-100 rounded-full items-center justify-center">
                  <EmailIcon size={20} color="#717171" />
                </View>
                <Text className="text-typography-700 flex-1">{business.email}</Text>
              </View>
            )}
          </View>

          {/* Spacer for bottom buttons */}
          <View className="h-32" />
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-background-0 border-t border-background-100"
        style={{
          paddingBottom: insets.bottom + 16,
          paddingTop: 16,
          paddingHorizontal: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 12,
        }}
      >
        <View className={`flex-row gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <TouchableOpacity
            onPress={handleWhatsApp}
            activeOpacity={0.7}
            className="flex-1 flex-row items-center justify-center gap-2 bg-[#25D366] py-4 rounded-xl"
            style={isRTL ? { flexDirection: 'row-reverse' } : undefined}
          >
            <WhatsAppIcon size={22} color="#FFFFFF" />
            <Text className="text-white font-bold text-base">
              {t('contact.whatsapp', 'WhatsApp')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCall}
            activeOpacity={0.7}
            className="flex-1 flex-row items-center justify-center gap-2 bg-primary-500 py-4 rounded-xl"
            style={isRTL ? { flexDirection: 'row-reverse' } : undefined}
          >
            <PhoneIcon size={22} color="#FFFFFF" />
            <Text className="text-white font-bold text-base">
              {t('contact.call', 'Call')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
