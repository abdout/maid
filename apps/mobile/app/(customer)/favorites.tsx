import { useCallback, useMemo } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useFavorites, useOptimisticFavorites, useToggleFavorite } from '@/hooks';
import { useAuth } from '@/store/auth';
import { MaidCard } from '@/components';
import { HeartIcon, UserIcon } from '@/components/icons';

export default function FavoritesScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const { data, isLoading, isRefetching, refetch } = useFavorites();
  const { isFavorite: checkIsFavorite } = useOptimisticFavorites();
  const toggleFavorite = useToggleFavorite();
  const serverFavorites = data?.data || [];

  // Guest mode: show login prompt
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background-0" edges={['top']}>
        <View className="px-6 pt-4 pb-4">
          <Text className={`text-2xl font-bold text-typography-900 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('profile.favorites')}
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-primary-50 items-center justify-center mb-4">
            <UserIcon size={40} color="#FF385C" />
          </View>
          <Text className="text-typography-900 font-semibold text-lg text-center">
            {t('auth.loginToSaveFavorites', 'Login to save favorites')}
          </Text>
          <Text className="text-typography-400 text-sm text-center mt-2">
            {t('auth.loginToSaveFavoritesDesc', 'Create an account to save your favorite workers')}
          </Text>
          <Pressable
            className="mt-6 bg-primary-500 px-8 py-3 rounded-full"
            onPress={() => router.push('/login')}
          >
            <Text className="text-white font-semibold">{t('auth.login')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Filter favorites list using optimistic state for instant removal
  const favorites = useMemo(() => {
    return serverFavorites.filter((fav) => checkIsFavorite(fav.maidId));
  }, [serverFavorites, checkIsFavorite]);

  const handleFavoritePress = useCallback((maidId: string) => {
    toggleFavorite.mutate({ maidId, isFavorite: true });
  }, [toggleFavorite]);

  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={['top']}>
      <View className="px-6 pt-4 pb-4">
        <Text className={`text-2xl font-bold text-typography-900 ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('profile.favorites')}
        </Text>
        <Text className={`text-typography-500 ${isRTL ? 'text-right' : 'text-left'}`}>
          {favorites.length} saved
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF385C" />
        </View>
      ) : favorites.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-primary-50 items-center justify-center mb-4">
            <HeartIcon size={40} color="#FF385C" />
          </View>
          <Text className="text-typography-900 font-semibold text-lg text-center">
            {t('common.noData')}
          </Text>
          <Text className="text-typography-400 text-sm text-center mt-2">
            Save maids you like to see them here
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isFav = checkIsFavorite(item.maidId);
            return (
              <MaidCard
                maid={item.maid}
                isFavorite={isFav}
                onFavoritePress={() => handleFavoritePress(item.maidId)}
              />
            );
          }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#FF385C"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
