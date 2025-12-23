import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMaids, useNationalities } from '@/hooks';
import { MaidCard } from '@/components';
import { useAuth } from '@/store/auth';
import { SearchIcon, UsersIcon, GlobeIcon, UserIcon } from '@/components/icons';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const isRTL = i18n.language === 'ar';

  const { data: nationalitiesData } = useNationalities();
  const { data: featuredData, isLoading } = useMaids({ pageSize: 5 });

  const nationalities = nationalitiesData?.data || [];
  const featuredMaids = featuredData?.data?.items || [];

  const nationalityEmojis: Record<string, string> = {
    PH: '🇵🇭',
    ID: '🇮🇩',
    ET: '🇪🇹',
    IN: '🇮🇳',
    LK: '🇱🇰',
    NP: '🇳🇵',
    BD: '🇧🇩',
    KE: '🇰🇪',
    UG: '🇺🇬',
    GH: '🇬🇭',
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search Bar - Airbnb style */}
        <Pressable
          onPress={() => router.push('/(customer)/search')}
          className="mx-6 mt-4 mb-6"
        >
          <View
            className={`flex-row items-center bg-background-0 rounded-full px-4 py-3 border border-background-200 ${isRTL ? 'flex-row-reverse' : ''}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            <View className={`flex-1 ${isRTL ? 'items-end' : 'items-start'}`}>
              <Text className="text-typography-500 text-base">
                {isRTL ? 'بحث' : 'Search'}
              </Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-primary-500 items-center justify-center">
              <SearchIcon size={18} color="#FFFFFF" />
            </View>
          </View>
        </Pressable>

        {/* Categories */}
        <View className="px-6 mb-6">
          <View className={`flex-row justify-between items-center mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className="text-lg font-semibold text-typography-900">
              {t('home.categories')}
            </Text>
            <Pressable onPress={() => router.push('/(customer)/search')}>
              <Text className="text-primary-500">{t('home.viewAll')}</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            {nationalities.slice(0, 6).map((nat) => (
              <Pressable
                key={nat.id}
                className="items-center p-4 bg-background-0 rounded-xl"
                style={{
                  minWidth: 85,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                onPress={() => router.push({
                  pathname: '/(customer)/search',
                  params: { nationalityId: nat.id },
                })}
              >
                {nationalityEmojis[nat.code] ? (
                  <Text className="text-3xl mb-2">
                    {nationalityEmojis[nat.code]}
                  </Text>
                ) : (
                  <View className="mb-2">
                    <GlobeIcon size={28} color="#717171" />
                  </View>
                )}
                <Text className="text-typography-700 text-sm text-center font-medium">
                  {isRTL ? nat.nameAr : nat.nameEn}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Featured Section */}
        <View className="px-6 mb-6">
          <View className={`flex-row justify-between items-center mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className="text-lg font-semibold text-typography-900">
              {t('home.featured')}
            </Text>
            <Pressable onPress={() => router.push('/(customer)/search')}>
              <Text className="text-primary-500">{t('home.viewAll')}</Text>
            </Pressable>
          </View>

          {isLoading ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color="#FF385C" />
            </View>
          ) : featuredMaids.length === 0 ? (
            <View className="bg-background-50 rounded-xl p-8 items-center">
              <View className="w-16 h-16 rounded-full bg-background-100 items-center justify-center mb-4">
                <UserIcon size={32} color="#B0B0B0" />
              </View>
              <Text className="text-typography-400 text-center">
                No maids available yet
              </Text>
            </View>
          ) : (
            featuredMaids.map((maid) => (
              <MaidCard key={maid.id} maid={maid} />
            ))
          )}
        </View>

        {/* Quick Stats */}
        <View className="px-6 mb-10">
          <View className={`flex-row gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <View className="flex-1 bg-primary-50 rounded-xl p-4">
              <View className="mb-2">
                <UsersIcon size={24} color="#FF385C" />
              </View>
              <Text className="text-primary-600 font-bold text-xl">
                {featuredData?.data?.total || 0}
              </Text>
              <Text className="text-primary-500 text-sm">Available Maids</Text>
            </View>
            <View className="flex-1 bg-success-50 rounded-xl p-4">
              <View className="mb-2">
                <GlobeIcon size={24} color="#008A05" />
              </View>
              <Text className="text-success-600 font-bold text-xl">
                {nationalities.length}
              </Text>
              <Text className="text-success-500 text-sm">Nationalities</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
