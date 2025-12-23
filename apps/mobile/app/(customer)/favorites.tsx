import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '@/hooks';
import { MaidCard } from '@/components';
import { HeartIcon } from '@/components/icons';

export default function FavoritesScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { data, isLoading, isRefetching, refetch } = useFavorites();
  const favorites = data?.data || [];

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
          renderItem={({ item }) => <MaidCard maid={item.maid} />}
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
