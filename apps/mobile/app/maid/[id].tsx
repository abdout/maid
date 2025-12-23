import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Modal,
  Dimensions,
  Share,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMaid, useIsFavorite, useToggleFavorite } from '@/hooks';
import { useCreateQuotation } from '@/hooks/use-quotations';
import { useAuth } from '@/store/auth';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  UserIcon,
  XIcon,
  ShareIcon,
  StarIcon,
  UsersIcon,
  GlobeIcon,
  BriefcaseIcon,
} from '@/components/icons';
import { LockedContactSection } from '@/components/locked-contact-section';
import { OfficeContactSection } from '@/components/office-contact-section';

const { width, height } = Dimensions.get('window');
const GALLERY_HEIGHT = height * 0.5;

export default function MaidDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const isRTL = i18n.language === 'ar';
  const insets = useSafeAreaInsets();

  const { data, isLoading, error } = useMaid(id);
  const { data: favoriteData } = useIsFavorite(id);
  const toggleFavorite = useToggleFavorite();
  const createQuotation = useCreateQuotation();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteNotes, setQuoteNotes] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentImageIndex(index);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this maid profile: https://maid-uae.vercel.app/maid/${id}`,
        url: `https://maid-uae.vercel.app/maid/${id}`,
      });
    } catch (error) {
      console.error('Share failed:', error);
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

  const { maid, nationality, languages, documents, office, isUnlocked, unlockPrice, unlockCurrency } = data.data;
  const isFavorite = favoriteData?.data?.isFavorite || false;

  const handleUnlock = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    router.push({
      pathname: '/payment/cv-unlock',
      params: { maidId: id },
    });
  };

  const photos = documents.filter((d) => d.type === 'photo');
  const allPhotos = maid.photoUrl ? [{ url: maid.photoUrl }, ...photos] : photos;

  const age = maid.dateOfBirth
    ? Math.floor((Date.now() - new Date(maid.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const handleFavorite = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    toggleFavorite.mutate({ maidId: id, isFavorite });
  };

  const handleRequestQuote = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      await createQuotation.mutateAsync({ maidId: id, notes: quoteNotes });
      setShowQuoteModal(false);
      setQuoteNotes('');
      // Show success message
      router.push('/(customer)/profile');
    } catch (err) {
      console.error('Quote request failed:', err);
    }
  };

  const statusColors: Record<string, { bg: string; text: string }> = {
    available: { bg: 'bg-success-500', text: t('maid.available') },
    busy: { bg: 'bg-warning-500', text: t('maid.busy') },
    reserved: { bg: 'bg-primary-500', text: t('maid.reserved') },
  };

  const status = statusColors[maid.status] || statusColors.available;

  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerTransparent: true,
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 bg-white/90 rounded-full items-center justify-center ml-4"
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
          ),
          headerRight: () => (
            <View className={`flex-row gap-2 mr-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
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
              <Pressable
                onPress={handleFavorite}
                className="w-10 h-10 bg-white/90 rounded-full items-center justify-center"
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
            </View>
          ),
        }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Photo Gallery - Airbnb Style */}
        <View style={{ height: GALLERY_HEIGHT }} className="bg-background-100">
          {allPhotos.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleImageScroll}
            >
              {allPhotos.map((photo, index) => (
                <Pressable
                  key={index}
                  onPress={() => setSelectedImage(photo.url)}
                  style={{ width, height: GALLERY_HEIGHT }}
                >
                  <Image
                    source={{ uri: photo.url }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <View className="w-full h-full items-center justify-center bg-background-100">
              <UserIcon size={80} color="#B0B0B0" />
            </View>
          )}

          {/* Image Counter - Airbnb Style */}
          {allPhotos.length > 1 && (
            <View className={`absolute bottom-4 ${isRTL ? 'left-4' : 'right-4'}`}>
              <View className="bg-black/60 px-3 py-1.5 rounded-full">
                <Text className="text-white text-sm font-medium">
                  {currentImageIndex + 1} / {allPhotos.length}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Content */}
        <View className="px-6 py-6">
          {/* Title Section - Airbnb Style */}
          <View className={`flex-row items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className="text-2xl font-bold text-typography-900">
              {isRTL && maid.nameAr ? maid.nameAr : maid.name}
            </Text>
            <View className={`px-3 py-1 rounded-full ${status.bg}`}>
              <Text className="text-white text-xs font-semibold">{status.text}</Text>
            </View>
          </View>

          {/* Subtitle with Nationality & Experience */}
          <Text className={`text-typography-500 mt-1 ${isRTL ? 'text-right' : ''}`}>
            {nationality && (isRTL ? nationality.nameAr : nationality.nameEn)}
            {nationality && maid.experienceYears ? ' • ' : ''}
            {maid.experienceYears ? `${maid.experienceYears} ${t('common.yearsExperience')}` : ''}
          </Text>

          {/* Section Divider */}
          <View className="border-b border-background-200 my-6" />

          {/* Quick Info Grid - Airbnb Style with Icons */}
          <View className={`flex-row flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
            {age && (
              <View className={`w-1/2 pb-4 ${isRTL ? 'pl-2' : 'pr-2'}`}>
                <View className={`flex-row items-center gap-3 p-4 bg-background-50 rounded-xl border border-background-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <View className="w-10 h-10 bg-background-100 rounded-full items-center justify-center">
                    <UserIcon size={20} color="#717171" />
                  </View>
                  <View className={isRTL ? 'items-end' : ''}>
                    <Text className="text-typography-400 text-xs">{t('filters.age')}</Text>
                    <Text className="text-typography-900 font-semibold">{age} {t('common.years')}</Text>
                  </View>
                </View>
              </View>
            )}
            <View className={`w-1/2 pb-4 ${isRTL ? 'pr-2' : 'pl-2'}`}>
              <View className={`flex-row items-center gap-3 p-4 bg-background-50 rounded-xl border border-background-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <View className="w-10 h-10 bg-background-100 rounded-full items-center justify-center">
                  <BriefcaseIcon size={20} color="#717171" />
                </View>
                <View className={isRTL ? 'items-end' : ''}>
                  <Text className="text-typography-400 text-xs">{t('filters.experience')}</Text>
                  <Text className="text-typography-900 font-semibold">{maid.experienceYears} {t('common.years')}</Text>
                </View>
              </View>
            </View>
            <View className={`w-1/2 pb-4 ${isRTL ? 'pl-2' : 'pr-2'}`}>
              <View className={`flex-row items-center gap-3 p-4 bg-background-50 rounded-xl border border-background-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <View className="w-10 h-10 bg-background-100 rounded-full items-center justify-center">
                  <UsersIcon size={20} color="#717171" />
                </View>
                <View className={isRTL ? 'items-end' : ''}>
                  <Text className="text-typography-400 text-xs">{t('filters.maritalStatus')}</Text>
                  <Text className="text-typography-900 font-semibold">
                    {t(`maritalStatus.${maid.maritalStatus}`)}
                  </Text>
                </View>
              </View>
            </View>
            <View className={`w-1/2 pb-4 ${isRTL ? 'pr-2' : 'pl-2'}`}>
              <View className={`flex-row items-center gap-3 p-4 bg-background-50 rounded-xl border border-background-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <View className="w-10 h-10 bg-background-100 rounded-full items-center justify-center">
                  <GlobeIcon size={20} color="#717171" />
                </View>
                <View className={isRTL ? 'items-end' : ''}>
                  <Text className="text-typography-400 text-xs">{t('filters.religion')}</Text>
                  <Text className="text-typography-900 font-semibold">
                    {t(`religion.${maid.religion}`)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Section Divider */}
          <View className="border-b border-background-200 mb-6" />

          {/* Languages - Amenities Style */}
          {languages.length > 0 && (
            <View className="pb-6 border-b border-background-200 mb-6">
              <Text className={`text-lg font-semibold text-typography-900 mb-4 ${isRTL ? 'text-right' : ''}`}>
                {t('filters.languages')}
              </Text>
              <View className={`flex-row flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                {languages.map((lang) => (
                  <View key={lang.id} className={`w-1/2 pb-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    <View className={`flex-row items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <GlobeIcon size={20} color="#717171" />
                      <Text className="text-typography-700 text-base">
                        {isRTL ? lang.nameAr : lang.nameEn}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Bio / About */}
          {(maid.bio || maid.bioAr) && (
            <View className="pb-6 border-b border-background-200 mb-6">
              <Text className={`text-lg font-semibold text-typography-900 mb-3 ${isRTL ? 'text-right' : ''}`}>
                {t('maid.bio')}
              </Text>
              <Text className={`text-typography-600 leading-6 ${isRTL ? 'text-right' : ''}`}>
                {isRTL && maid.bioAr ? maid.bioAr : maid.bio}
              </Text>
            </View>
          )}

          {/* Salary - Prominent Display */}
          <View className="pb-6 border-b border-background-200 mb-6">
            <Text className={`text-lg font-semibold text-typography-900 mb-3 ${isRTL ? 'text-right' : ''}`}>
              {t('filters.salary')}
            </Text>
            <View className={`flex-row items-baseline gap-1 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
              <Text className="text-3xl font-bold text-typography-900">
                {parseInt(maid.salary).toLocaleString()}
              </Text>
              <Text className="text-xl font-semibold text-typography-500">
                {t('common.aed')}
              </Text>
              <Text className="text-typography-400 text-base">
                / {t('common.month')}
              </Text>
            </View>
          </View>

          {/* Office Contact Section */}
          {isUnlocked && office ? (
            <OfficeContactSection
              office={{
                name: isRTL && office.nameAr ? office.nameAr : office.name,
                phone: office.phone,
                email: office.email,
                address: office.address,
                isVerified: office.isVerified,
              }}
            />
          ) : (
            <LockedContactSection
              price={unlockPrice || 99}
              currency={unlockCurrency || 'AED'}
              onUnlock={handleUnlock}
            />
          )}

          {/* Spacer for bottom button */}
          <View className="h-24" />
        </View>
      </ScrollView>

      {/* Bottom Action - Airbnb Reservation Style */}
      {maid.status === 'available' && (
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
          <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <View>
              <View className={`flex-row items-baseline gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Text className="text-xl font-bold text-typography-900">
                  {parseInt(maid.salary).toLocaleString()}
                </Text>
                <Text className="text-typography-500 font-medium">
                  {t('common.aed')}
                </Text>
              </View>
              <Text className="text-typography-400 text-sm">
                {t('common.perMonth')}
              </Text>
            </View>
            <Pressable
              onPress={() => setShowQuoteModal(true)}
              className="px-8 py-4 bg-primary-500 rounded-xl active:bg-primary-600"
              style={{
                shadowColor: '#FF385C',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text className="text-white font-bold text-base">
                {t('maid.requestQuote')}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Image Modal */}
      <Modal visible={!!selectedImage} transparent animationType="fade">
        <View className="flex-1 bg-black/95">
          <Pressable
            onPress={() => setSelectedImage(null)}
            className="absolute top-12 right-4 z-10 w-10 h-10 bg-white/10 rounded-full items-center justify-center"
          >
            <XIcon size={24} color="#FFFFFF" />
          </Pressable>
          <Pressable
            onPress={() => setSelectedImage(null)}
            className="flex-1 items-center justify-center"
          >
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                className="w-full h-96"
                resizeMode="contain"
              />
            )}
          </Pressable>
        </View>
      </Modal>

      {/* Quote Request Modal */}
      <Modal visible={showQuoteModal} transparent animationType="slide">
        <View className="flex-1 justify-end">
          <Pressable
            onPress={() => setShowQuoteModal(false)}
            className="flex-1 bg-black/50"
          />
          <View className="bg-background-0 rounded-t-3xl p-6">
            <View className={`flex-row items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Text className="text-xl font-bold text-typography-900">
                {t('quotation.title')}
              </Text>
              <Pressable
                onPress={() => setShowQuoteModal(false)}
                className="w-8 h-8 rounded-full bg-background-100 items-center justify-center"
              >
                <XIcon size={18} color="#717171" />
              </Pressable>
            </View>

            <Text className={`text-typography-500 mb-2 ${isRTL ? 'text-right' : ''}`}>
              {t('quotation.notes')}
            </Text>
            <View className="bg-background-50 rounded-xl p-4 mb-4 min-h-[100px]">
              <Text
                className={`text-typography-900 ${isRTL ? 'text-right' : ''}`}
                onPress={() => {}}
              >
                {quoteNotes || 'Add any special requirements...'}
              </Text>
            </View>

            <View className={`flex-row gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Pressable
                onPress={() => setShowQuoteModal(false)}
                className="flex-1 py-4 bg-background-200 rounded-xl items-center"
              >
                <Text className="text-typography-700 font-medium">{t('common.cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={handleRequestQuote}
                disabled={createQuotation.isPending}
                className="flex-1 py-4 bg-primary-500 rounded-xl items-center"
              >
                <Text className="text-white font-semibold">
                  {createQuotation.isPending ? t('common.loading') : t('quotation.submit')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
