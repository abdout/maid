import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMaids, useOptimisticFavorites, useToggleFavorite, useDebounce } from '@/hooks';
import { useAuth } from '@/store/auth';
import { MaidCard, FilterModal } from '@/components';
import { SearchIcon, FilterIcon } from '@/components/icons';
import type { MaidFilters } from '@maid/shared';

export default function SearchScreen() {
  const { t, i18n } = useTranslation();
  const { nationalityId } = useLocalSearchParams<{ nationalityId?: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const isRTL = i18n.language === 'ar';

  // Favorites - using optimistic state for instant UI updates
  const { isFavorite: checkIsFavorite } = useOptimisticFavorites();
  const toggleFavorite = useToggleFavorite();

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [showFilters, setShowFilters] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [filters, setFilters] = useState<Partial<MaidFilters>>(
    nationalityId ? { nationalityIds: [nationalityId] } : {}
  );
  const [page, setPage] = useState(1);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isRefetching, refetch } = useMaids({
    ...filters,
    search: debouncedSearch.length >= 2 ? debouncedSearch : undefined,
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

  const handleFavoritePress = useCallback((maidId: string, isFavorite: boolean) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    toggleFavorite.mutate({ maidId, isFavorite });
  }, [isAuthenticated, router, toggleFavorite]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Search Header - Unified search + filter container */}
        <View className="px-6 pt-4 pb-4">
        <View
          className={`flex-row items-center bg-background-0 rounded-full border ${
            isFocused ? 'border-primary-500' : 'border-background-200'
          } ${isRTL ? 'flex-row-reverse' : ''}`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: isFocused ? 2 : 1 },
            shadowOpacity: isFocused ? 0.12 : 0.08,
            shadowRadius: isFocused ? 8 : 4,
            elevation: isFocused ? 4 : 2,
          }}
        >
          {/* Search Icon */}
          <View className={isRTL ? 'pr-4 pl-2' : 'pl-4 pr-2'}>
            <SearchIcon size={20} color={isFocused ? '#FF385C' : '#717171'} />
          </View>

          {/* Search Input */}
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={t('home.searchPlaceholder')}
            placeholderTextColor="#717171"
            className={`flex-1 h-12 text-typography-900 ${isRTL ? 'text-right' : 'text-left'}`}
            style={{ writingDirection: isRTL ? 'rtl' : 'ltr' }}
          />

          {/* Separator */}
          <View className="w-px h-6 bg-background-200" />

          {/* Filter Button */}
          <Pressable
            onPress={() => setShowFilters(true)}
            className={`flex-row items-center h-12 ${isRTL ? 'pl-4 pr-3' : 'pr-4 pl-3'}`}
          >
            <FilterIcon size={20} color="#222222" />
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
          renderItem={({ item }) => {
            const isFav = checkIsFavorite(item.id);
            return (
              <MaidCard
                maid={item}
                isFavorite={isFav}
                onFavoritePress={() => handleFavoritePress(item.id, isFav)}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
