import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams} from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMaids } from '@/hooks';
import { MaidCard, FilterModal } from '@/components';
import { SearchIcon, FilterIcon } from '@/components/icons';
import type { MaidFilters } from '@maid/shared';

export default function SearchScreen() {
  const { t, i18n } = useTranslation();
  const { nationalityId } = useLocalSearchParams<{ nationalityId?: string }>();
  const isRTL = i18n.language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Partial<MaidFilters>>(
    nationalityId ? { nationalityId } : {}
  );
  const [page, setPage] = useState(1);

  const { data, isLoading, isRefetching, refetch } = useMaids({
    ...filters,
    page,
    pageSize: 20,
  });

  const maids = data?.data?.items || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 1;

  const handleApplyFilters = useCallback((newFilters: Partial<MaidFilters>) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (page < totalPages && !isLoading) {
      setPage((p) => p + 1);
    }
  }, [page, totalPages, isLoading]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={['top']}>
      {/* Search Header */}
      <View className="px-6 pt-4 pb-4">
        <View className={`flex-row items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <View
            className={`flex-1 flex-row items-center bg-background-0 rounded-pill px-4 py-3 ${isRTL ? 'flex-row-reverse' : ''}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <SearchIcon size={20} color="#717171" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('home.searchPlaceholder')}
              placeholderTextColor="#717171"
              className={`flex-1 text-typography-900 ${isRTL ? 'text-right mr-3' : 'text-left ml-3'}`}
            />
          </View>
          <Pressable
            onPress={() => setShowFilters(true)}
            className="bg-background-0 p-3 rounded-xl relative"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <FilterIcon size={20} color="#222222" />
            {activeFilterCount > 0 && (
              <View className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* Results Count */}
      <View className="px-6 pb-2">
        <Text className={`text-typography-500 ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('search.results', { count: total })}
        </Text>
      </View>

      {/* Results */}
      {isLoading && page === 1 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF385C" />
        </View>
      ) : maids.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-16 h-16 rounded-full bg-background-100 items-center justify-center mb-4">
            <SearchIcon size={32} color="#B0B0B0" />
          </View>
          <Text className="text-typography-400 text-center">{t('search.noResults')}</Text>
          {activeFilterCount > 0 && (
            <Pressable
              onPress={() => setFilters({})}
              className="mt-4 px-6 py-3 bg-primary-500 rounded-lg"
            >
              <Text className="text-white font-medium">{t('filters.reset')}</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={maids}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MaidCard maid={item} />}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#FF385C"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoading && page > 1 ? (
              <View className="py-4">
                <ActivityIndicator color="#FF385C" />
              </View>
            ) : null
          }
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />
    </SafeAreaView>
  );
}
